package com.example.uploader.folders

import android.os.Parcelable
import com.google.firebase.firestore.ServerTimestamp
import kotlinx.android.parcel.Parcelize
import java.util.*
import kotlin.collections.ArrayList

data class Folder(
  var name: String? = null,
  var id: String? = null,
  var parentId: String? = null,
  var path: ArrayList<Path>? = arrayListOf(Path("/","Home")),
  var owner: Owner? = null,
  @ServerTimestamp
  var createdAt: Date? = null
)

@Parcelize
data class Path(
  var id: String? = null,
  var name: String? = null
):Parcelable

data class Owner(
  var displayName: String? = null,
  var photoURL: String? = null
)
