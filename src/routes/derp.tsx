export function Derp() {
  return (
    <div>
      <GradientImageCard />
    </div>
  )
}

function GradientImageCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg">
      {/* Background Image */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: "url('/logo.png')" }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 w-full p-4 text-white">
        <h3 className="text-lg font-semibold">Beautiful Scenery</h3>
        <p className="text-sm opacity-80">Experience nature at its finest.</p>

        {/* Links */}
        <div className="mt-2 flex gap-3">
          <a href="#" className="text-sm font-medium hover:underline">
            Learn More
          </a>
          <a href="#" className="text-sm font-medium hover:underline">
            Explore
          </a>
        </div>
      </div>
    </div>
  )
}
