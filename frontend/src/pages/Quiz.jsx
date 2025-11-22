import PageHeader from "../components/PageHeader";
import Nav from "../components/Nav";

export default function Quiz(){
    return(<>
            <div>
                <PageHeader
                        isOnCreatePost={true}
                        isOnSearchBar={true}
                        // onPostCreated={fetchPost}
                        // isDropDownOpen={isDropDownOpen}
                        // toggleDropDown={toggleDropDown}
                        // openProfilePage={openProfilePage}
                        // openSetting={openSetting}
                        // openNotificationBar={isNotificationBarOpen}
                        // closeNotificationBar={()=>cycleNotificationBarOpen()}
                        
                      />
                      <div>
                        <Nav currentPage="quiz" />
                      </div>
            </div>
    </>);
}