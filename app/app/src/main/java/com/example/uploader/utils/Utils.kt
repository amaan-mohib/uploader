package com.example.uploader.utils

import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.R
import com.google.gson.Gson
import org.json.JSONObject

fun RecyclerView.autoFitColumns(columnWidth:Int=200){
  val displayMetrics=this.context.resources.displayMetrics
  val noOfColumns = ((displayMetrics.widthPixels / displayMetrics.density) / columnWidth).toInt()
  this.layoutManager=GridLayoutManager(this.context,noOfColumns)
}

const val webClientURL="https://delta-uploader.web.app"
const val serverURL="https://delta-uploader-api.herokuapp.com"

fun getTypeIcon(type: String?): Int {
  return when (type) {
    "image" -> R.drawable.ic_baseline_image_24
    "video" -> R.drawable.ic_baseline_ondemand_video_24
    "audio" -> R.drawable.ic_baseline_audio_file_24
    "application" -> R.drawable.ic_baseline_insert_drive_file_24
    "text" -> R.drawable.ic_baseline_article_24
    else -> R.drawable.ic_baseline_insert_drive_file_24
  }
}

fun getJSONObject(data: Any?): JSONObject {
  val jsonData=Gson().toJson(data)
  return JSONObject(jsonData)
}

fun formatSize(inSize:Long?):String{
  var res = ""
  var size=inSize?.toDouble()
  if(size!=null) {
    if (size in 0.0..1024.0) {
      res = "%.2f B".format(size)
    } else if (size > 1024.0 && size <= 1024.0 * 1024.0) {
      size /= 1024.0
      res = "%.2f KB".format(size)
    } else if (size > 1024.0 * 1024.0 && size <= 1024.0 * 1024.0 * 1024.0) {
      size /= (1024.0 * 1024.0)
      res = "%.2f MB".format(size)
    } else if (size > 1024.0 * 1024.0 * 1024.0 && size <= Double.MAX_VALUE) {
      size /= (1024.0 * 1024.0 * 1024.0)
      res = "%.2f GB".format(size)
    }
  }
  return res
}