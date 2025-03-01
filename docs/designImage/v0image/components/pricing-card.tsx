import Link from "next/link"
import { CheckCircle } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline" | "secondary"
  highlighted?: boolean
}

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border ${
        highlighted ? "border-teal-600 shadow-lg scale-105" : "border-gray-200 hover:shadow-md"
      } bg-white`}
    >
      <div
        className={`pb-8 pt-6 text-center ${
          highlighted ? "bg-gradient-to-r from-teal-500 to-coral-500 text-white" : ""
        }`}
      >
        <div className="text-sm font-semibold uppercase">{title}</div>
        <div className="mt-2 flex items-baseline justify-center">
          <span className="text-4xl font-bold">{price}</span>
          {period && (
            <span className={`ml-1 text-sm ${highlighted ? "text-white/80" : "text-gray-500"}`}>{period}</span>
          )}
        </div>
        <p className={`mt-2 text-sm ${highlighted ? "text-white/80" : "text-gray-500"}`}>{description}</p>
      </div>
      <div className="flex-1 p-6">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 pt-0">
        <button
          className={`w-full rounded-md px-4 py-2 text-sm font-medium ${
            buttonVariant === "default"
              ? "bg-gradient-to-r from-teal-500 to-coral-500 text-white hover:from-teal-600 hover:to-coral-600"
              : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
          } transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2`}
        >
          <Link href="/register">{buttonText}</Link>
        </button>
      </div>
    </div>
  )
}

