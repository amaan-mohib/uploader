package com.example.uploader.socketInfo

import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime

data class User(
  @SerializedName("sid") var sid:String?="",
  @SerializedName("uid") var uid:String?="",
  @SerializedName("host") var host:Boolean?=false,
  @SerializedName("info") var info:Info
)

data class Info(
  @SerializedName("browserName") var browserName:String?= "App",
  @SerializedName("OSName") var OSName:String?="Android",
  @SerializedName("username") var username: String?="",
  @SerializedName("time") var time:String?= LocalDateTime.now().toString(),
)

data class UserInfo(
  @SerializedName("uuid") var uuid:String?="",
  @SerializedName("user") var user:User
)
