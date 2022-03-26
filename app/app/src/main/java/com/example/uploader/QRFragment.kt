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
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.databinding.FragmentQrBinding
import com.example.uploader.files.File
import com.example.uploader.files.FileUploadAdapter
import com.example.uploader.folders.Owner
import com.example.uploader.socketInfo.Info
import com.example.uploader.socketInfo.User
import com.example.uploader.socketInfo.UserInfo
import com.example.uploader.utils.*
import com.example.uploader.viewmodels.UUIDViewModel
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.WriterException
import io.socket.client.Ack
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.create
import java.util.*
import kotlin.collections.ArrayList

class QRFragment : Fragment() {

  private lateinit var binding: FragmentQrBinding
  private lateinit var qrCodeImageView: ImageView
  private lateinit var cpb: CircularProgressIndicator
  private lateinit var deviceConnected: TextView
  private lateinit var receivedFiles: TextView
  private lateinit var fileRecyclerView: RecyclerView
  private lateinit var fileArrayList: ArrayList<File>
  private lateinit var fileAdapter: FileUploadAdapter

  private val viewModel by viewModels<UUIDViewModel>()
  private val currentUser: FirebaseUser? = FirebaseAuth.getInstance().currentUser

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
    val socket = SocketHandler.getSocket()

    qrCodeImageView = binding.qrcode
    cpb = binding.cpb
    deviceConnected = binding.deviceConnected
    receivedFiles = binding.received

    fileRecyclerView = binding.receivedFilesList
    fileRecyclerView.layoutManager = LinearLayoutManager(requireContext())
    fileArrayList = arrayListOf()
    fileAdapter = FileUploadAdapter(fileArrayList, true)
    fileRecyclerView.adapter = fileAdapter

    receivedFiles.text = getString(R.string.received_files, 0)
    deviceConnected.text = getString(R.string.device_connected, 0)

    getUUID(uuid)

    viewModel.shortUUID.observe(viewLifecycleOwner) { shortUUID ->
      if (shortUUID.isNotEmpty()) {
        val bitmap = generateQR(shortUUID)

        qrCodeImageView.visibility = View.VISIBLE
        cpb.visibility = View.GONE
        qrCodeImageView.setImageBitmap(bitmap)

        emitInfo(socket, uuid)
        getConnectUsers(socket)
        getReceivedFiles(socket)
      } else {
        cpb.visibility = View.VISIBLE
        qrCodeImageView.visibility = View.GONE
      }
    }

  }

  private fun getReceivedFiles(socket: Socket) {
    socket.on("recieve files") { args ->
      if (args[0] != null) {
        val file = args[0] as JSONObject
        val name = file.getString("name")
        val type = file.getString("type")
        val size = file.getLong("size")
        val url = file.getString("url")
        val sentBy = file.getJSONObject("sentBy")
        val displayName = sentBy.getString("displayName")

        activity?.runOnUiThread {
          fileArrayList.add(
            File(
              name = name,
              type = type,
              size = size,
              url = url,
              owner = Owner(displayName = displayName)
            )
          )
          fileArrayList.distinctBy { it.url }

          if (fileArrayList.isNotEmpty()){
            receivedFiles.visibility=View.VISIBLE
            fileRecyclerView.visibility=View.VISIBLE
            receivedFiles.text = getString(R.string.received_files, fileArrayList.size)
          }

          fileAdapter.notifyItemInserted(fileArrayList.size)
        }
      }
    }
  }

  private fun getConnectUsers(socket: Socket) {
    socket.on("connected users") { args ->
      if (args[0] != null) {
        val users = args[0] as JSONObject
        val connectedUsers = users.get("connected") as JSONArray
        Log.i(TAG, "users: ${connectedUsers.length()}")
        activity?.runOnUiThread {
          deviceConnected.text = getString(R.string.device_connected, connectedUsers.length() - 1)
        }
      }
    }
  }

  private fun emitInfo(socket: Socket, uuid: String) {
    val data = UserInfo(
      uuid = uuid,
      user = User(
        sid = socket.id(),
        uid = currentUser?.uid,
        host = true,
        info = Info(username = currentUser?.displayName)
      )
    )
//    val jsonData= Gson().toJson(data)
//    Log.i(TAG,jsonData)
    socket.emit("join", getJSONObject(data), Ack { args ->
      if (args.isNotEmpty()) {
        val error = args[0]
        Log.e(TAG, "callback error $error")
      }
    })
  }

  private fun getUUID(uuid: String) {
    val uuidApi = RetrofitHelper.getInstance().create<ApiInterface>()

    uuidApi.getShortUUID(uuid).enqueue(object : Callback<String> {
      override fun onResponse(call: Call<String>, response: Response<String>) {
        val res = response.body()
        if (response.code() == 200 && res != null) {
          viewModel.shortUUID.value = res.toString()
          Log.i(TAG, "short: $res")
        }
      }

      override fun onFailure(call: Call<String>, t: Throwable) {
        viewModel.shortUUID.value = ""
        Log.e(TAG, "failed")
      }
    })


  }

  private fun generateQR(uuid: String): Bitmap {
    val text = "$webClientURL/scan/$uuid"
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