import "./UserSkeleton.css";

const UserSkeleton = () => {
  return (
    <div className="skeleton_container">
      <div className="skeleton_left">
        <div className="skeleton_avatar" />
        <div className="skeleton_text_group">
          <div className="skeleton_text_name" />
          <div className="skeleton_text_sub" />
        </div>
      </div>
      <div className="skeleton_button" />
    </div>
  );
};

export default UserSkeleton;
