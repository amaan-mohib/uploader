package com.example.uploader.utils

import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Path

interface ApiInterface {
  @GET("/short/{uuid}")
  fun getShortUUID(@Path("uuid") uuid:String):Call<String>
}