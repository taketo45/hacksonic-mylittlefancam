'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function UploadPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    // フォルダ名を取得（最初のファイルのパスから抽出）
    if (fileList.length > 0 && fileList[0].webkitRelativePath) {
      const folderPath = fileList[0].webkitRelativePath.split('/')[0]
      setSelectedFolder(folderPath)
    }

    // 画像ファイルのみをフィルタリング
    const imageFiles: File[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (file.type.startsWith('image/')) {
        imageFiles.push(file)
      }
    }

    setFiles(imageFiles)
    setError(null)
    setSuccess(false)
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError('アップロードするファイルがありません')
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const totalFiles = files.length
      let uploadedFiles = 0

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `photos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        // Exif情報の取得（実際のExif情報取得はクライアントサイドでは制限があるため、簡易的な実装）
        const exifData = {
          dateTime: new Date().toISOString(),
          make: 'Unknown',
          model: 'Unknown',
          exposureTime: 'Unknown',
          fNumber: 'Unknown',
          iso: 'Unknown',
        }

        // OriginalPhotoTBLにデータを保存
        const { error: dbError } = await supabase.from('original_photos').insert([
          {
            storage_url: filePath,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            exif_date_time: exifData.dateTime,
            exif_make: exifData.make,
            exif_model: exifData.model,
            exif_exposure_time: exifData.exposureTime,
            exif_f_number: exifData.fNumber,
            exif_iso: exifData.iso,
          },
        ])

        if (dbError) {
          throw dbError
        }

        uploadedFiles++
        setProgress(Math.round((uploadedFiles / totalFiles) * 100))
      }

      setSuccess(true)
    } catch (err) {
      console.error('アップロードエラー:', err)
      setError('ファイルのアップロード中にエラーが発生しました')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">写真アップロード</h1>
        <p className="mt-1 text-gray-600">
          イベントの写真をアップロードします。フォルダを選択すると、そのフォルダ内の全ての写真がアップロードされます。
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
          <p>全てのファイルが正常にアップロードされました！</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <label htmlFor="folder-input" className="mb-2 block text-sm font-medium text-gray-700">
            フォルダを選択
          </label>
          <div className="mt-1 flex items-center">
            <input
              id="folder-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFolderSelect}
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              aria-label="フォルダを選択"
              title="フォルダを選択"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
            >
              フォルダを選択
            </button>
            {selectedFolder && (
              <span className="ml-3 text-sm text-gray-500">
                選択されたフォルダ: {selectedFolder}
              </span>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              選択された写真: {files.length}枚
            </h3>
            <div className="max-h-60 overflow-y-auto rounded-md border border-gray-200 p-2">
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {uploading && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              アップロード進捗: {progress}%
            </h3>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-milab-600"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? 'アップロード中...' : 'アップロード開始'}
          </button>
        </div>
      </div>
    </div>
  )
} 