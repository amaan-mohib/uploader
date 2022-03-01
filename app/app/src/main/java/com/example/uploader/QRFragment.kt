package com.example.uploader

import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.viewModels
import com.example.uploader.databinding.FragmentQrBinding
import com.example.uploader.utils.ApiInterface
import com.example.uploader.utils.RetrofitHelper
import com.example.uploader.utils.webClientURL
import com.example.uploader.viewmodels.UUIDViewModel
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.WriterException
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.create
import java.util.*

class QRFragment : Fragment() {

  private lateinit var binding: FragmentQrBinding
  private lateinit var qrCodeImageView: ImageView
  private lateinit var cpb: CircularProgressIndicator
  private lateinit var deviceConnected: TextView
  private lateinit var receivedFiles: TextView
  private val viewModel by viewModels<UUIDViewModel>()

//  override fun onCreate(savedInstanceState: Bundle?) {
//    super.onCreate(savedInstanceState)
//
//  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    binding = FragmentQrBinding.inflate(inflater)

    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    val uuid = UUID.randomUUID().toString()
    qrCodeImageView = binding.qrcode
    cpb=binding.cpb
    deviceConnected=binding.deviceConnected
    receivedFiles=binding.received

    receivedFiles.text=getString(R.string.received_files,0)
    deviceConnected.text=getString(R.string.device_connected,0)

    getUUID(uuid)
    viewModel.shortUUID.observe(viewLifecycleOwner) { shortUUID ->
      if (shortUUID.isNotEmpty()) {
        val bitmap = generateQR(shortUUID)

        qrCodeImageView.visibility = View.VISIBLE
        cpb.visibility = View.GONE
        qrCodeImageView.setImageBitmap(bitmap)
      } else {
        cpb.visibility = View.VISIBLE
        qrCodeImageView.visibility = View.GONE
      }
    }

  }

  private fun getUUID(uuid: String) {
    val uuidApi = RetrofitHelper.getInstance().create<ApiInterface>()

      uuidApi.getShortUUID(uuid).enqueue(object : Callback<String>{
        override fun onResponse(call: Call<String>, response: Response<String>) {
          val res=response.body()
          if(response.code()==200 && res!=null){
            viewModel.shortUUID.value=res.toString()
            Log.i(TAG, "short: $res")
          }
        }

        override fun onFailure(call: Call<String>, t: Throwable) {
          viewModel.shortUUID.value=""
          Log.e(TAG,"failed")
        }
      })


  }

  private fun generateQR(uuid: String): Bitmap {
    val text = "$webClientURL/$uuid"
    val height = 400
    val width = 400
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val codeWriter = MultiFormatWriter()
    try {
      val bitMatrix = codeWriter.encode(text, BarcodeFormat.QR_CODE, width, height)
      for (x in 0 until width) {
        for (y in 0 until height) {
          bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
        }
      }
    } catch (e: WriterException) {
      Log.d(TAG, "generateQRCode: ${e.message}")
    }

    return bitmap
  }

  companion object {
    const val TAG = "QRFragment"
  }
}