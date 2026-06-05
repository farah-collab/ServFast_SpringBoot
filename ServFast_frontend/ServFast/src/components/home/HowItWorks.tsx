const steps = [
  { num: "1", title: "Post a Request", desc: "Tell us what you need. Our AI helps match you with the right professionals for your specific task." },
  { num: "2", title: "Select Expert", desc: "Review detailed profiles, ratings, and past work. Easily find the professional that meets your needs." },
  { num: "3", title: "Secure Payment", desc: "Funds are held in escrow and released only when you are 100% satisfied with the professional delivery." },
];

export default function HowItWorks() {
  return (
    <section className="px-16 py-14 bg-gray-50">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">How it works</h2>
      <p className="text-center text-gray-400 text-sm mb-12">Get the results you need in three simple steps.</p>
      <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto">
        {steps.map((step) => (
          <div key={step.num} className="text-center group">
            <div className="w-13 h-13 rounded-full border-2 border-red-700 flex items-center justify-center mx-auto mb-4 font-extrabold text-lg text-red-700 bg-white transition-all group-hover:bg-red-700 group-hover:text-white">
              {step.num}
            </div>
            <h3 className="font-bold text-base text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}