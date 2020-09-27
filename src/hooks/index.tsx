

interface ISignS3Props {
    url: string,
    objectName: string,
    contentType: string | null,
    path: string
}

// interface ISignedResponse {
//     data: {
//         signedUrl: string,
//         publicUrl: string
//     }
// }

interface IUPloadFileProps {
    signParams: ISignS3Props,
    imageBinary: Blob | undefined,

}

const useS3 = () => {
    const signS3 = async ({ url, objectName, contentType, path }: ISignS3Props) => {
        try {
            const response: Promise<Response> = await fetch(`${url}/s3/sign`, {
                params: {
                    objectName,
                    contentType,
                    path,
                },
            });
            return ({ signedUrl: response.data.signedUrl, publicUrl: response.data.publicUrl });
        } catch (error) {
            return error;
        }

    }

    // TODO: Add response type
    const uploadFile = async ({ signParams: { url, objectName, contentType, path }, imageBinary }: IUPloadFileProps) => {
        try {
            const { signedUrl, publicUrl } = await signS3({ url, objectName, contentType, path })
        }
        catch (error) {
            return error;
        }

        try {
            const uploadRestaurantImageS3Response = await fetch(signedUrl,
                {
                    method: 'PUT',
                    body: imageBinary,
                    headers: { "Content-Type": imageType },
                    params: {
                        objectName,
                        contentType,
                        path,
                    },
                }
            );

            try {
                if (uploadRestaurantImageS3Response.status === 200) {
                    return publicUrl;
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

    return {
        signS3,
        uploadFile
    }

}

export default useS3
