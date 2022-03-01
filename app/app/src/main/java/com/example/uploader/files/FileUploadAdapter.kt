package com.example.uploader.files

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.R
import com.example.uploader.utils.getTypeIcon

class FileUploadAdapter(private val fileList: ArrayList<File>):RecyclerView.Adapter<FileUploadAdapter.FileViewHolder>() {
  class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val fileName: TextView = itemView.findViewById(R.id.list_item_text)
    val size: TextView = itemView.findViewById(R.id.list_item_secondary_text)
    val fileType: ImageView = itemView.findViewById(R.id.list_item_icon)
  }

  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.file_list_item, parent, false)
    return FileViewHolder(itemView)
  }

  override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
    val file: File = fileList[position]

    var typeCleaned = "application"

    holder.fileName.text = file.name.toString()
    holder.size.text=file.size.toString()

    file.type?.split("/")?.get(0)?.also { typeCleaned = it }
    holder.fileType.setImageResource(getTypeIcon(typeCleaned))
  }

  override fun getItemCount(): Int {
    return fileList.size
  }
}