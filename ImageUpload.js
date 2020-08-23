import React, { useState } from "react";

const dataURIToBlob = (dataURI, fileType) => {
  const binary = atob(dataURI.split(",")[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: fileType });
};

const ImageUpload = ({ S3Path, image, altText, label, onFileUploaded }) => {
  let imageBinary = null;
  let imageType = null;
  const [loading, setLoading] = useState(false);
  const [visibleImage, setVisibleImage] = useState(image);

  const uploadFile = async () => {
    // TODO: Set loading state to save button
    const s3SignedLinkResponse = await fetch("/s3/sign", {
      params: {
        objectName: `objectName.${imageType}`,
        contentType: imageType,
        path: S3Path,
      },
    });
    try {
      const uploadRestaurantImageS3Response = await S3AxiosInstance.put(
        s3SignedLinkResponse.data.signedUrl,
        imageBinary,
        {
          headers: {
            "Content-Type": imageType,
          },
        }
      );
      try {
        if (uploadRestaurantImageS3Response.status === 200) {
          setVisibleImage(s3SignedLinkResponse.data.publicUrl);
          return s3SignedLinkResponse.data.publicUrl;
        }
      } catch (err) {
        console.log("Couldn't uploaded to s3 ");
        return err;
      }
    } catch (err) {
      console.log("S3signedlink couldn't retrieved");
      return err;
    }
  };
  function handleUploadChange(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      imageType = file.type.split("/")[1];
      imageBinary = dataURIToBlob(reader.result, file.type);
    };
    reader.onloadend = () => {
      uploadImage()
        .then((res) => {
          onFileUploaded(res);
          setLoading(false);
        })
        .catch(() => {
          onFileUploaded(null);
          setLoading(false);
        });
    };

    reader.onerror = () => {
      console.log("error on load image");
    };
  }
  const handleDelete = () => {
    setVisibleImage(null);
    onFileUploaded("");
  };
  return (
    <Card className={classes.root}>
      <CardHeader
        className="bg-magicBlue text-white shadow-1"
        action={
          visibleImage && (
            <>
              <IconButton edge="start" color="secondary" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
              <IconButton
                variant="outlined"
                target="_blank"
                href={visibleImage}
              >
                <GetAppIcon />
              </IconButton>
            </>
          )
        }
        title={label}
      />

      <CardContent>
        {visibleImage && (
          <CardMedia
            className={classes.media}
            image={visibleImage}
            alt={altText}
            title="Paella dish"
          />
        )}
        {!visibleImage && (
          <label
            htmlFor="button-file"
            className="flex flex-col items-center justify-center relative w-fuull h-128 rounded-8 overflow-hidden cursor-pointer"
          >
            <span>Uplaod your image from here</span>
            <input
              accept="image/*"
              className="hidden"
              id="button-file"
              type="file"
              onChange={handleUploadChange}
            />
            {!loading && (
              <Icon fontSize="large" color="action">
                cloud_upload
              </Icon>
            )}
            <RotateLoader
              override="display: block; margin: 0 auto; border-color: red;"
              color="red"
              size={15}
              loading={loading}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
