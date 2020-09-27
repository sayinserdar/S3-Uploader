import React, { useState } from "react";
import useS3 from './hooks'

interface IProps {
  image: string | undefined,
  onFileUploaded: (state: boolean | null) => void;
}


const dataURIToBlob = (dataURI: string, fileType: string) => {
  
  let binary: string;
  let dataArray = [];
  if (dataURI.split(',')[1]) {
    binary = atob(dataURI.split(',')[1]);
    for (let i = 0; i < binary.length; i++) {
      dataArray.push(binary.charCodeAt(i));
    }
  }
  return new Blob([new Uint8Array(dataArray)], { type: fileType });
};


const index = ({ image,onFileUploaded }: IProps) => {
  const { uploadFile } = useS3();
  //  const {signedUrl, publicUrl} = await signS3({url: "https://www.example.com",contentType:'jpeg',objectName:'test.jpeg',path: 'files/images'});
  //   console.log({signedUrl, publicUrl} );


  let imageBinary: Blob | undefined = undefined;
  let imageType: string;
  const [loading, setLoading] = useState<boolean>(false);
  const [visibleImage, setVisibleImage] = useState<string | undefined>(image);

  function handleUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement;
    // TODO: ADD error handling for reader exceptions
    const file: File = (target.files as FileList)[0];
    if (!file) {
      // TODO: Throw error in here
      return "error";
    }
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);


    reader.onload = () => {
      try {
      imageType = file.type.split("/")[1];
      }
      catch(err ) {
        throw new Error("File type can't be found");
      }
      
      const dataURI = reader.result as string;
      imageBinary = dataURIToBlob(dataURI, file.type);
    };

    reader.onloadend = async () => {
      const response = await uploadFile({signParams: {url: 'https://www.example.com',objectName: 'hehe',contentType: imageType,path: 'files'},imageBinary})
      return response;
    };

    reader.onerror = () => {
          console.log("error on load image");
          return "error";
    };
    return null;
  }

  const handleDelete = () => {
          setVisibleImage(undefined);
    onFileUploaded(null);
  };
  return (
    <label
          htmlFor="button-file"
          className="flex flex-col items-center justify-center relative w-fuull h-128 rounded-8 overflow-hidden cursor-pointer"
        >
          <span>Uplaod your image from here</span>
          <img src={visibleImage}></img>
<          button type="button" onClick={handleDelete}></button>
          <input
            accept="image/*"
            className="hidden"
            id="button-file"
            type="file"
            onChange={handleUploadChange}
          />
          {loading && (

            <div>Loading...</div>
          )}
        </label>
  );
};

export default index;
