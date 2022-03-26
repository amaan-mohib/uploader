package com.example.uploader.utils

import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Path

interface ApiInterface {
  @GET("/short/{uuid}")
  fun getShortUUID(@Path("uuid") uuid: String): Call<String>

  @GET("/uuid/{sid}")
  fun getUUID(@Path("sid") uuid: String): Call<String>

  @GET("/is-users/{uuid}")
  fun getIsUsers(@Path("uuid") uuid: String): Call<Boolean>
}