package com.example.uploader.utils

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {
  private lateinit var mSocket:Socket

  @Synchronized
  fun setSocket(){
    try{
      mSocket=IO.socket(serverURL)
    }catch (e: URISyntaxException){
      Log.e("SocketHandler","cannot connect socket: ${e.reason}")
    }
  }

  @Synchronized
  fun getSocket(): Socket {
    return mSocket
  }

  @Synchronized
  fun connect() {
    mSocket.connect()
  }

  @Synchronized
  fun close() {
    mSocket.disconnect()
  }

  @Synchronized
  fun isConnected():Boolean {
    return mSocket.connected()
  }
}