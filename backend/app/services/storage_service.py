import cloudinary.uploader

def upload_file(file):
    result = cloudinary.uploader.upload(
        file=file,
        resource_type="raw"
    )

    return result["secure_url"]