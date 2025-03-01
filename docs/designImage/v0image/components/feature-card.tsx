import type { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const Icon = LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-coral-100 text-teal-600">
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}

