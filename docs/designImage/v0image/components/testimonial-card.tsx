import Image from "next/image"

interface TestimonialCardProps {
  name: string
  role: string
  content: string
  avatar: string
}

export default function TestimonialCard({ name, role, content, avatar }: TestimonialCardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      <div className="p-6">
        <div className="mb-4 text-4xl text-gradient bg-gradient-to-r from-teal-600 to-coral-500 bg-clip-text text-transparent">
          "
        </div>
        <p className="mb-4 text-gray-500">{content}</p>
      </div>
      <div className="border-t bg-gray-50 p-6">
        <div className="flex items-center gap-4">
          <Image src={avatar || "/placeholder.svg"} width={40} height={40} alt={name} className="rounded-full" />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{role}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

