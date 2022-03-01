package com.example.uploader.files

import com.example.uploader.folders.Owner
import com.example.uploader.folders.Path
import com.google.firebase.firestore.ServerTimestamp
import java.util.*
import kotlin.collections.ArrayList

data class File(
  var name: String? = null,
  var id: String? = null,
  var type: String? = null,
  var url: String? = null,
  var size: Long? = null,
  var parentId: String? = null,
  var path: ArrayList<Path>? = arrayListOf(Path("/","Home")),
  var owner: Owner? = null,
  @ServerTimestamp
  var createdAt: Date? = null
)