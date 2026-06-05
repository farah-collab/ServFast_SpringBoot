export default function TrustedBy() {
  return (
    <div className="bg-amber-50 px-20 py-7 text-center border-t border-b border-amber-200">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-4">
        Trusted by leading companies
      </p>
      <div className="flex justify-center items-center gap-12 flex-wrap">
        {["Airbus", "KPMG", "Deloitte", "Oracle", "Siemens"].map((name) => (
          <span
            key={name}
            className="font-black text-lg text-amber-300"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}