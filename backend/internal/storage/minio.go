package storage

import (
	"context"
	"mime/multipart"
	"os"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

const BucketName = "xambook-assets"

func InitMinio() error {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")

	client, err := minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(
			accessKey,
			secretKey,
			"",
		),

		Secure: false,
	})

	if err != nil {
		return err
	}

	MinioClient = client

	exists, err := client.BucketExists(
		context.Background(),
		BucketName,
	)

	if err != nil {
		return err
	}

	if !exists {
		err = client.MakeBucket(
			context.Background(),
			BucketName,
			minio.MakeBucketOptions{},
		)

		if err != nil {
			return err
		}
	}

	return nil
}

func UploadFile(
	file multipart.File,
	fileSize int64,
	contentType string,
) (string, error) {

	objectName := "questions/" + uuid.New().String()

	_, err := MinioClient.PutObject(
		context.Background(),
		BucketName,
		objectName,
		file,
		fileSize,
		minio.PutObjectOptions{
			ContentType: contentType,
		},
	)

	if err != nil {
		return "", err
	}

	url := "https://minio.xambook.com/" +
		BucketName +
		"/" +
		objectName

	return url, nil
}
