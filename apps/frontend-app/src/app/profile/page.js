"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Check,
  Shield,
  Camera,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const ProfilePage = () => {
  const { user, loading: isLoading, updateUser, getInitials } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone ? user.phone.replace("62", "") : "",
      });
    }
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak tersedia";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Tidak tersedia";
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Tidak tersedia";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "1 hari yang lalu";
      if (diffDays < 30) return `${diffDays} hari yang lalu`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
      return `${Math.floor(diffDays / 365)} tahun yang lalu`;
    } catch {
      return "Tidak tersedia";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone ? user.phone.replace("62", "") : "",
      });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length <= 13) {
      setEditForm({ ...editForm, phone: cleanValue });
    }
  };

  const handleSave = async () => {
    if (!editForm.first_name.trim() || !editForm.last_name.trim()) {
      toast.error("Nama depan dan belakang harus diisi");
      return;
    }

    if (editForm.phone && (editForm.phone.length < 8 || editForm.phone.length > 13)) {
      toast.error("Nomor telepon harus 8-13 digit");
      return;
    }

    setIsSaving(true);

    try {
      const updatedData = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone.trim() ? `62${editForm.phone.trim()}` : "",
      };

      const result = await updateUser(updatedData);

      if (result) {
        setIsEditing(false);
        toast.success("Profil berhasil diperbarui!");
      } else {
        toast.error("Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const ProfileField = React.memo(({ icon: Icon, label, value, isEditing, type = "text", onChange, placeholder, readonly = false, prefix = "", suffix = "" }) => (
    <div className="group">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 group-hover:bg-[#72BAA9]/10 transition-colors">
          <Icon size={14} className="text-gray-600 dark:text-gray-400 group-hover:text-[#72BAA9] transition-colors" />
        </div>
        <span>{label}</span>
      </label>
      
      {isEditing && !readonly ? (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-[#72BAA9] bg-[#72BAA9]/10 px-2 py-1 rounded">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete="off"
            className={`w-full px-4 py-3 ${prefix ? 'pl-16' : ''} bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72BAA9]/50 focus:border-[#72BAA9] transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500`}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {prefix && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-[#72BAA9] bg-[#72BAA9]/10 rounded-md">
              {prefix}
            </span>
          )}
          <p className="text-lg text-gray-900 dark:text-white font-medium">
            {value || "Tidak tersedia"}
          </p>
          {readonly && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              Tidak dapat diubah
            </span>
          )}
        </div>
      )}
    </div>
  ));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#72BAA9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Memuat profil...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Gagal Memuat Profil
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Terjadi kesalahan saat memuat data profil Anda
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-[#72BAA9] text-white px-6 py-3 rounded-xl hover:bg-[#5da89a] transition-all duration-200 transform hover:scale-105"
          >
            Kembali ke Login
          </button>
        </motion.div>
      </div>
    );
  }

  // Create the background pattern as a style object
  const patternStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-green-900/10 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Enhanced Header */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#72BAA9] via-[#474E93] to-[#72BAA9] opacity-90"></div>
            <div className="absolute inset-0" style={patternStyle}></div>
            
            <div className="relative px-8 py-16">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl border border-white/20">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={16} className="text-white" />
                  </div>
                </motion.div>

                {/* Profile Info */}
                <div className="text-center md:text-left text-white flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-3 drop-shadow-lg"
                  >
                    {user.first_name} {user.last_name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/90 text-xl mb-4 drop-shadow"
                  >
                    {user.email}
                  </motion.p>
                  
                  {/* Status Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3 justify-center md:justify-start"
                  >
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 ${
                      user.is_verified ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        user.is_verified ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {user.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <Clock size={14} />
                      <span className="text-sm">Bergabung {formatRelativeTime(user.created_at)}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Action Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Informasi Profil
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Kelola informasi profil dan pengaturan akun Anda
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.button
                      key="edit"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-gradient-to-r from-[#72BAA9] to-[#5da89a] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <Edit2 size={18} />
                      <span className="font-medium">Edit Profil</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex space-x-3"
                    >
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save size={18} />
                        )}
                        <span className="font-medium">
                          {isSaving ? "Menyimpan..." : "Simpan"}
                        </span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-400 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                      >
                        <X size={18} />
                        <span className="font-medium">Batal</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-8"
                >
                  <ProfileField
                    icon={User}
                    label="Nama Depan"
                    value={isEditing ? editForm.first_name : user.first_name}
                    isEditing={isEditing}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    placeholder="Masukkan nama depan"
                  />

                  <ProfileField
                    icon={User}
                    label="Nama Belakang"
                    value={isEditing ? editForm.last_name : user.last_name}
                    isEditing={isEditing}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    placeholder="Masukkan nama belakang"
                  />

                  <ProfileField
                    icon={Mail}
                    label="Alamat Email"
                    value={user.email}
                    isEditing={false}
                    readonly={true}
                  />
                </motion.div>

                {/* Right Column */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-8"
                >
                  <ProfileField
                    icon={Phone}
                    label="Nomor Telepon"
                    value={isEditing ? editForm.phone : (user.phone ? user.phone.replace("62", "") : "")}
                    isEditing={isEditing}
                    type="tel"
                    onChange={handlePhoneChange}
                    placeholder="8123456789"
                    prefix="+62"
                  />

                  <ProfileField
                    icon={Calendar}
                    label="Tanggal Bergabung"
                    value={formatDate(user.created_at)}
                    isEditing={false}
                    readonly={true}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group"
                  >
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                      <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 group-hover:bg-[#72BAA9]/10 transition-colors">
                        <Shield size={14} className="text-gray-600 dark:text-gray-400 group-hover:text-[#72BAA9] transition-colors" />
                      </div>
                      <span>Status Verifikasi</span>
                    </label>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 ${
                        user.is_verified 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          user.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className={`font-medium ${
                          user.is_verified 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {user.is_verified ? 'Akun Terverifikasi' : 'Belum Terverifikasi'}
                        </span>
                        {user.is_verified && (
                          <Check size={16} className="text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;