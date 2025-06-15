export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-6 pt-30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#474E93] dark:text-blue-400 mb-6">Apa itu zoneTix?</h1>
          <div className="w-20 h-1 bg-[#474E93] dark:bg-blue-400 mx-auto mb-8"></div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 text-center mb-8">
            zoneTix adalah platform digital terdepan untuk pembelian tiket event dan perjalanan secara cepat,
            aman, dan terpercaya. Kami menghadirkan pengalaman baru dalam mengakses berbagai acara menarik di seluruh Indonesia.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-16 h-16 bg-[#474E93] dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-[#474E93] dark:text-blue-400 mb-2">Cepat & Mudah</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pembelian tiket hanya dalam hitungan menit</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="w-16 h-16 bg-[#474E93] dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-[#474E93] dark:text-blue-400 mb-2">Aman & Terpercaya</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sistem keamanan terjamin untuk setiap transaksi</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="w-16 h-16 bg-[#474E93] dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-[#474E93] dark:text-blue-400 mb-2">Beragam Pilihan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ribuan event dan destinasi menanti Anda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}