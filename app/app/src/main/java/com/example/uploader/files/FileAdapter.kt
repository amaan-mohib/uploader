package com.example.uploader.files

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.R
import com.example.uploader.utils.getTypeIcon
import com.squareup.picasso.Callback
import com.squareup.picasso.Picasso
import java.lang.Exception

class FileAdapter(private val fileList: ArrayList<File>) :
  RecyclerView.Adapter<FileAdapter.FileViewHolder>() {
  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FileViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.file_item, parent, false)
    return FileViewHolder(itemView)
  }

  override fun onBindViewHolder(holder: FileViewHolder, position: Int) {
    val file: File = fileList[position]
    var typeCleaned = "application"

    holder.name.text = file.name

    file.type?.split("/")?.get(0)?.also { typeCleaned = it }

    getPhotoURL(holder, file.url, file.type)
    holder.type.setImageResource(getTypeIcon(typeCleaned))
  }

  override fun getItemCount(): Int {
    return fileList.size
  }

  class FileViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val name: TextView = itemView.findViewById(R.id.file_name)
    val type: ImageView = itemView.findViewById(R.id.file_type_preview)
    val preview: ImageView = itemView.findViewById(R.id.file_preview)
  }



  private fun getPhotoURL(holder: FileViewHolder, url: String?, type: String?) {

    if (type?.isEmpty() == true) {
      holder.preview.setImageResource(getTypeIcon("unknown"))
      holder.preview.scaleType = ImageView.ScaleType.FIT_CENTER

      return
    }
    val imageType = type?.split("/")
    val isImage = type?.split("/")?.get(0) == "image"

    if (isImage) {
      if (imageType?.get(1) == "svg+xml") {
        holder.preview.setImageResource(R.drawable.ic_baseline_image_24)
        holder.preview.scaleType = ImageView.ScaleType.FIT_CENTER

        return
      } else {
        Picasso.get()
          .load(url)
          .resize(500, 500)
          .placeholder(R.drawable.ic_baseline_image_24)
          .centerCrop()
          .into(holder.preview,object:Callback{
            override fun onSuccess() {
              holder.preview.scaleType = ImageView.ScaleType.CENTER_CROP
            }

            override fun onError(e: Exception?) {
              Log.e("FileAdapter","Error loading image: $e")
            }
          })

        return
      }
    } else {
      holder.preview.setImageResource(getTypeIcon(imageType?.get(0)))
      holder.preview.scaleType = ImageView.ScaleType.FIT_CENTER

      return
    }
  }
}