export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-6 pt-30">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[#474E93] dark:text-blue-400 mb-6">Kebijakan Privasi</h1>
                    <div className="w-20 h-1 bg-[#474E93] dark:bg-blue-400 mx-auto mb-8"></div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="w-12 h-12 bg-[#474E93] dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xl">🛡️</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[#474E93] dark:text-blue-400 mb-3">Komitmen Privasi Kami</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                Kami menghargai dan melindungi privasi Anda dengan standar keamanan tertinggi. 
                                Informasi pribadi yang Anda berikan akan digunakan hanya untuk kepentingan transaksi 
                                dan layanan zoneTix, sesuai dengan kebijakan yang berlaku.
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h3 className="font-semibold text-[#474E93] dark:text-blue-400 mb-2">📋 Data yang Kami Kumpulkan</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Hanya informasi yang diperlukan untuk transaksi dan layanan</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h3 className="font-semibold text-[#474E93] dark:text-blue-400 mb-2">🔐 Keamanan Data</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Enkripsi tingkat tinggi untuk melindungi informasi Anda</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}