export default function Banner() {
  return (
    <div className="container mx-auto px-4 mb-10">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 md:p-14 text-center text-white shadow-xl flex flex-col items-center justify-center min-h-[220px]">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
          TechStore
        </h2>
        <p className="text-lg md:text-2xl font-medium text-blue-100 max-w-lg mx-auto">
          Đồ điện tử chất lượng cao, giá siêu tốt
        </p>
      </div>
    </div>
  );
}