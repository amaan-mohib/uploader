package com.example.uploader.files

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.R
import com.example.uploader.utils.formatSize
import com.example.uploader.utils.getTypeIcon

class FileUploadAdapter(private val fileList: ArrayList<File>,private val isReceived:Boolean=false):RecyclerView.Adapter<FileUploadAdapter.FileViewHolder>() {
  class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val fileName: TextView = itemView.findViewById(R.id.list_item_text)
    val size: TextView = itemView.findViewById(R.id.list_item_secondary_text)
    val fileType: ImageView = itemView.findViewById(R.id.list_item_icon)
  }

  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.file_list_item, parent, false)
    return FileViewHolder(itemView)
  }

  @SuppressLint("SetTextI18n")
  override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
    val file: File = fileList[position]

    var typeCleaned = "application"

    holder.fileName.text = file.name.toString()

    if(isReceived){
      holder.size.text = "${formatSize(file.size)} • Sent by ${file.owner?.displayName}"
    }else {
      holder.size.text = formatSize(file.size)
    }

    file.type?.split("/")?.get(0)?.also { typeCleaned = it }
    holder.fileType.setImageResource(getTypeIcon(typeCleaned))
  }

  override fun getItemCount(): Int {
    return fileList.size
  }
}