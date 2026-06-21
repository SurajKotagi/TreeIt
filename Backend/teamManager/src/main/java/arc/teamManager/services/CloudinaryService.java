package arc.teamManager.services;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;

    public String uploadAvatar(MultipartFile file) throws IOException {
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "tree-it-avatars", // Keeps your Cloudinary dashboard clean
                        "transformation", new Transformation().width(256).height(256).crop("thumb").gravity("face")));

        // This returns the permanent https://... string!
        return uploadResult.get("secure_url").toString();
    }
}
