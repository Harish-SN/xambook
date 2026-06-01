package handlers

import (
	"net/http"

	"github.com/Harish-SN/xambook-backend/internal/storage"
	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	fileHeader, err := c.FormFile("image")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "image required",
		})
		return
	}

	file, err := fileHeader.Open()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to open image",
		})
		return
	}

	defer file.Close()

	url, err := storage.UploadFile(
		file,
		fileHeader.Size,
		fileHeader.Header.Get("Content-Type"),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url": url,
	})
}
