"use client"
import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  children?: React.ReactNode
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = 'danger',
  children
}: ConfirmModalProps) {
  if (!isOpen) return null

  const typeColors = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'
  }

  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600'
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${iconColors[type]} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
          {children && <div className="mt-6 text-left">{children}</div>}
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${typeColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
