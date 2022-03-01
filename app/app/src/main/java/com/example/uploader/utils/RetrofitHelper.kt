package com.example.uploader.utils

import com.google.gson.GsonBuilder
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitHelper {
  fun getInstance(): Retrofit {
    val gson = GsonBuilder().setLenient().create()
    return Retrofit.Builder().baseUrl(serverURL)
      .addConverterFactory(GsonConverterFactory.create(gson))
      .build()
  }
}