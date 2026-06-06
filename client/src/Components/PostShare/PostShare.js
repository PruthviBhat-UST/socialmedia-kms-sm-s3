import React, { useState, useRef } from 'react'
import './PostShare.css';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { uploadImage } from '../../api/UploadRequest';
import { uploadPost } from '../../actions/UploadAction';

const PostShare = () => {

    const loading = useSelector((state) => state.postReducer.uploading)
    const [image, setImage] = useState(null);
    const imageRef = useRef();
    const dispatch = useDispatch();
    const desc = useRef();
    const { user } = useSelector((state) => state.authReducer.authData);

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            setImage(img);
        }
    }

    const reset = () => {
        setImage(null);
        desc.current.value = ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newPost = {
            userId: user._id,
            desc: desc.current.value,
        }

        // If image selected - upload to S3 first, get URL back
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("type", "post");  // tells backend which S3 folder

            try {
                // Upload to S3 via backend
                const response = await uploadImage(data);
                
                // Save the FULL S3 URL in post (not just filename!)
                newPost.image = response.data.url;
                
                console.log("✅ Image uploaded to S3:", response.data.url);
            } catch (error) {
                console.log("❌ Image upload failed:", error);
                return; // Stop if image upload fails
            }
        }

        // Create the post with S3 image URL
        dispatch(uploadPost(newPost));
        reset();
    }

    return (
        <div className="PostShare">
            <img 
                src={user.profilePicture || "/defaultProfile.png"} 
                alt="" 
            />

            <div>
                <input 
                    type="text" 
                    placeholder='Write a caption...' 
                    required 
                    ref={desc} 
                />

                <div className="postOptions">
                    <div 
                        className="option" 
                        style={{ color: "var(--photo)" }}
                        onClick={() => imageRef.current.click()}
                    >
                        <PhotoOutlinedIcon />
                        Photo
                    </div>

                    <div className="option" style={{ color: "var(--video)" }}>
                        <PlayCircleOutlineIcon />
                        Video
                    </div>

                    <div className="option" style={{ color: "var(--location)" }}>
                        <LocationOnOutlinedIcon />
                        Location
                    </div>

                    <div className="option" style={{ color: "var(--shedule)" }}>
                        <CalendarMonthOutlinedIcon />
                        Shedule
                    </div>

                    <button 
                        className='button ps-button' 
                        onClick={handleSubmit} 
                        disabled={loading}
                    >
                        {loading ? "uploading..." : "Share"}
                    </button>

                    <div style={{ display: "none" }}>
                        <input
                            type="file"
                            name='myImage'
                            ref={imageRef}
                            onChange={onImageChange}
                        />
                    </div>
                </div>

                {image && (
                    <div className="previewImage">
                        <CloseOutlinedIcon onClick={() => setImage(null)} />
                        <img src={URL.createObjectURL(image)} alt="" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostShare
