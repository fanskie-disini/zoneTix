export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-6 pt-30">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[#474E93] dark:text-blue-400 mb-6">Syarat dan Ketentuan</h1>
                    <div className="w-20 h-1 bg-[#474E93] dark:bg-blue-400 mx-auto mb-8"></div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="w-12 h-12 bg-[#474E93] dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[#474E93] dark:text-blue-400 mb-3">Ketentuan Penggunaan</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                Dengan menggunakan layanan zoneTix, Anda menyetujui seluruh syarat dan ketentuan yang berlaku.
                                Pastikan Anda membaca dan memahami seluruh ketentuan sebelum melakukan pembelian atau penggunaan platform.
                            </p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mt-8">
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-[#474E93] dark:text-blue-400 text-xl">✅</span>
                            <span className="text-gray-700 dark:text-gray-300">Penggunaan platform sesuai dengan aturan yang berlaku</span>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-[#474E93] dark:text-blue-400 text-xl">🎫</span>
                            <span className="text-gray-700 dark:text-gray-300">Kebijakan pembatalan dan pengembalian tiket</span>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <span className="text-[#474E93] dark:text-blue-400 text-xl">⚖️</span>
                            <span className="text-gray-700 dark:text-gray-300">Tanggung jawab pengguna dan penyedia layanan</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Syarat dan ketentuan dapat berubah sewaktu-waktu. 
                            Silakan periksa halaman ini secara berkala untuk update terbaru.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}