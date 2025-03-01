interface HowItWorksStepProps {
  number: string
  title: string
  description: string
}

export default function HowItWorksStep({ number, title, description }: HowItWorksStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-coral-500 text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}

