# BASE 64 CONVERTER

  //converter function from base64 string url into file path so I can pass it in as request in the backend
  // const convertBase64ToFile = (base64String, fileName) => {

  //   try {

  //     const byteString = atob(base64String);

  //     const arrayBuffer = new ArrayBuffer(byteString.length);
  //     const uintArray = new Uint8Array(arrayBuffer);

  //     for (let i = 0; i < byteString.length; i++) {
  //       uintArray[i] = byteString.charCodeAt(i);
  //     }

  //     const blob = new Blob([uintArray], { type: 'image/jpeg' }); 
  //     return new File([blob], fileName, { type: 'image/jpeg' });

  //   }catch(error) {
  //     navigate('/urlErr')
  //   }
    
  // };

  import shopGraffitiBG from '../../../public/assets/shopGraffiti1.png'