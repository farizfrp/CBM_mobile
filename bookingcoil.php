<?php
public function appcoil(Request $request) {
        
       $userax = $request->get('userax');
       $bookingid = $request->get('bookingid');
       $appnote = $request->get('appnote');
       $username = $request->get('username');

       $data = BookCoil::where('bookingid', $bookingid)->update([
                   'status' => '0',
                   'bmapp' => $userax,
                   'appnote' => $appnote,
                   'bmapp_at' => now(),
       ]);
       $emails = ['skyfox387@gmail.com', 'fariz.aldo@gmail.com', 'sinax89@gmail.com'];


       response()->json('Data Berhasil Approve', $this->success_code)->send();
       $this->notifsales($username, $bookingid);

       Mail::to($emails)->send(new CbmMobileMail($bookingid)); 
       return;
       

   }




   class CbmMobileMail extends Mailable
{
public $headerPBC

public function __construct($dataheader)
{
   $this->headerPBC = $dataheader;

}


public function build()
{
    return $this->from('itdevelopmentcbm@gmail.com')
                ->view('emailku')
                ->with(
                [
                    'pesan' => $this->headerPBC->bookingid,
                    'nama' => $this->headerPBC->customer
                    //'website' => 'Uji Coba Kirim Email',
                ]);

}
}





public function notifsales($username, $bookingid, $isApprove) {
   
       $type = '4';     
       $bodyMsg = array("app"=>"✅ Booking Coil Telah Di Approve BM: ", "not_app"=>"❌ Booking Coil Ditolak BM: ");
       
       $bodyName = $bodyMsg[$isApprove] . ' ' . $bookingid;
         
       $tokenax = DB::select("SELECT firebase_token FROM master_karyawan 
                                   WHERE username = '$username'");
                                   
       foreach ($tokenax as $data) {
           $this->approvetoken = $data->firebase_token;
       }

       $fcmUrl = 'https://fcm.googleapis.com/fcm/send';
       $token  = $this->approvetoken;
       //'dGZKilM0QnmSZJ2oYwY8Lc:APA91bGtNIcexcT_YQXWhhTs4EASHDPScLNQAnVw3Qf9sU42K2juoFQIAnnbuEay9P7xV6JLhCMTn9H73Kk8QzSAxR9y40KBsDNd6L6qRHJqjLd-5WSlqiNRiZ1KVqE8fEu8ut8_uZSY';

   $notification = [
       'title' => 'BOOKING COIL',
       'body' =>  $bodyName,
       'type' => $type,
       'sound' => true,
   ];
   
   $extraNotificationData = $notification;

   $fcmNotification = [
       //'registration_ids' => $tokenList, //multple token array
       'notification'  => $notification,
       'to'            => $token, //single token
       'data'          => $extraNotificationData,
   ];

   $headers = [
       'Authorization: key=AAAAoH0hSj8:APA91bH9GB_uXYRxURKd73_o7ug_ZhTOJrggOxiKb0focuc-0bkRaRsjxKI7KadMEfvNYUYBdmMX0z-lPy1qEA485w28XYxGyWd-vwBeeEIeTtmgYYg5J5R1CcK1qIBAanGoPh6lL7B_',
       'Content-Type: application/json'
   ];

   $ch = curl_init();
   curl_setopt($ch, CURLOPT_URL,$fcmUrl);
   curl_setopt($ch, CURLOPT_POST, true);
   curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
   curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fcmNotification));
   $result = curl_exec($ch);
   curl_close($ch);

   return response()->json($fcmNotification);
   }








   private function checkMasterDataMysqlIfExist($master_data_mysql) {

    $value = count($master_data_mysql);

    //check if the user is exist on mysql database
    if ($value == 0) {
        return $this->checkDataFromSIAP($this->username);
    } else {
        foreach ($master_data_mysql as $item_master) {
            //1. check if the user is logged in
            
                //2. check if password encrypted
                if ($item_master->pwd_en == 1) {
                    if (Hash::check($this->password, $item_master->password)) {   
                       if ($item_master->android_login == 2) {

                            $this->sendnotiflogout($item_master->username);
        
                        return response()->json("You have logged in on another device, please logout");
                    } 
                        //update android login
                        $this->updateAL = AndroidLogin::where('android_login', 0)
                                ->where('username', $item_master->username)
                                ->update(['android_login' => 2]);
                                //sending data to user 
                        return $this->dataSendToUser($master_data_mysql);    
                    } else {
                        return response()->json("Please, check your password 1");
                    }
                } else if($item_master->pwd_en == 0) {
                    if ($this->password == $item_master->password) {
                        if ($item_master->android_login == 2) {

                            $this->sendnotiflogout($item_master->username);
        
                        return response()->json("You have logged in on another device, please logout");
                    } 
                        //update password with hashing
                        $hash_pwd = Hash::make($this->password);
                        $pwdUpdate = AndroidLogin::where('android_login', 0)
                                ->where('username', $item_master->username)
                                ->update(['password' => $hash_pwd, 'android_login' => 2, 'pwd_en' => 1]);
                        return $this->dataSendToUser($master_data_mysql);
                    } else {
                        return response()->json("Please, check your password 2");
                    }
                }
             else if ($item_master->android_login == 2) {

                    $this->sendnotiflogout($item_master->username);

                return response()->json("You have logged in on another device, please logout");
            } else if ($item_master->android_login == 1) {
                return response()->json("Your user account is stuck, please contact your Administrator");
            }
        }
    }        
}




















        ?>

        