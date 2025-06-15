import { useState } from "react";

export default function CheckoutModal({ show, onClose, user, total }) {
  const [showPayment, setShowPayment] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md pointer-events-auto border border-gray-300">
        {!showPayment ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Formulir Checkout</h2>

            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nama</label>
                <input
                  type="text"
                  value={user?.user_metadata?.name || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Nomor HP</label>
                <input
                  type="text"
                  value={user?.user_metadata?.phone || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Total Harga</label>
                <input
                  type="text"
                  value={`Rp ${total?.toLocaleString("id-ID")}`}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayment(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Pesan Sekarang
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Pembayaran</h2>
            <p className="mb-2">Silakan scan QRIS berikut untuk membayar:</p>
            <div className="border rounded p-4 flex justify-center bg-gray-100">
              <img
                src="/qris-example.png"
                alt="QRIS"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Setelah pembayaran, tiket akan dikirim ke email Anda.
            </p>
            <div className="text-right mt-4">
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Selesai
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
