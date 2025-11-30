import "./DraftPage.css";
import PageHeader from '../components/PageHeader';
import ProfilePage from '../components/ProfilePage';
import HelpPage from '../components/HelpPage';
import Settings from '../components/Settings';
import Nav from '../components/Nav';
import { useState, useEffect } from "react";
import { useCycle } from "framer-motion";
import { getCurrentUser } from '../services/auth';

export default function DraftPage() {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen, cycleNotificationBarOpen] = useCycle(false, true);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [openHelpPage, cycleOpenHelpPage] = useCycle(false, true);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  
  console.log(drafts);

  useEffect(() => {
    console.log('=== STEP 1: Component mounted ===');
    const currentUser = getCurrentUser();
    console.log('Current user from auth:', JSON.stringify(currentUser, null, 2));
    
    // If user doesn't have username, fetch it from the server
    if (currentUser?.id && !currentUser.username) {
      fetchUserDetails(currentUser);
    } else {
      setUser(currentUser);
    }
  }, []);

  const fetchUserDetails = async (currentUser) => {
    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/getUserDetails.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: currentUser.id })
      });
      
      const data = await response.json();
      if (data.success && data.username) {
        setUser({ ...currentUser, username: data.username });
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser(currentUser);
    }
  };

  useEffect(() => {
    console.log('=== STEP 2: User state changed ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    
    if (user?.id) {
      console.log('User has ID, fetching drafts...');
      fetchDrafts();
    } else {
      console.log('No user ID found');
      setLoading(false);
      if (user !== null) {
        setError('Please log in to view your drafts');
      }
    }
  }, [user]);

  const fetchDrafts = async () => {
   
    setLoading(true);
    setError(null);
    
    if (!user?.id) {
      console.error('ERROR: No user.id available!');
      setError('User not authenticated');
      setDrafts([]);
      setLoading(false);
      return;
    }
    
    try {
      const requestBody = {
        user_id: user.id
      };
      
      console.log('=== STEP 4: Sending request ===');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      console.log('URL: http://localhost/Sociatech/backend/auth/getDraft.php');
      
      const response = await fetch('http://localhost/Sociatech/backend/auth/getDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('=== STEP 5: Response received ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
      }

      const data = await response.json();
      console.log('=== STEP 6: JSON parsed ===');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('=== SUCCESS ===');
        console.log('Number of drafts:', data.drafts?.length || 0);
        console.log('Drafts data:', JSON.stringify(data.drafts, null, 2));
        setDrafts(data.drafts || []);
      } else {
        console.error('=== FETCH FAILED ===');
        console.error('Error from server:', data.error);
        setError(data.error || 'Failed to fetch drafts');
        setDrafts([]);
      }
    } catch (error) {
      console.error('=== EXCEPTION OCCURRED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      setError('Failed to load drafts: ' + error.message);
      setDrafts([]);
    } finally {
      console.log('=== STEP 7: Setting loading to false ===');
      setLoading(false);
    }
  };

  const handlePublishDraft = async (draftId) => {
    console.log('Publishing draft:', draftId);
    
    if (!user?.id) {
      alert('Please log in to publish drafts');
      return;
    }

    if (!window.confirm('Are you sure you want to publish this draft?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/publishDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          draft_id: draftId,
          user_id: user.id
        })
      });

      const data = await response.json();
      console.log('Publish response:', data);
      
      if (data.success) {
        alert('Draft published successfully!');
        fetchDrafts();
      } else {
        alert('Failed to publish draft: ' + data.error);
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Something went wrong while publishing draft.');
    }
  };

  const handleDeleteDraft = async (draftId) => {
    console.log('Deleting draft:', draftId);
    
    if (!user?.id) {
      alert('Please log in to delete drafts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/deleteDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          draft_id: draftId,
          user_id: user.id
        })
      });

      const data = await response.json();
      console.log('Delete response:', data);
      
      if (data.success) {
        alert('Draft deleted successfully!');
        fetchDrafts();
      } else {
        alert('Failed to delete draft: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Something went wrong while deleting draft.');
    }
  };

  // console.log('=== RENDER ===');
  // console.log('Loading:', loading);
  // console.log('Error:', error);
  // console.log('Drafts count:', drafts.length);
  // console.log('User:', user);

  return (
    <div className="draftPage_parent_container">
      <PageHeader
        setIsDropDownOpen={setIsDropDownOpen}
        isDropDownOpen={isDropDownOpen}
        cycleNotificationBarOpen={cycleNotificationBarOpen}
        isNotificationBarOpen={isNotificationBarOpen}
        setIsProfilePageOpen={setIsProfilePageOpen}
        setIsSettingOpen={setIsSettingOpen}
      />
      <div className="draftPage_child_container">
        <Nav cycleOpenHelpPage={cycleOpenHelpPage} />
        <div className="draftPage_body">
          <div className="draftPage_header">
            <h1 className="draftPage_title">Drafts</h1>
          </div>

          {loading ? (
            <div className="drafts_loading">Loading drafts...</div>
          ) : error ? (
            <div className="drafts_error">
              <p>{error}</p>
              <button onClick={fetchDrafts}>Retry</button>
            </div>
          ) : drafts.length === 0 ? (
            <div className="drafts_empty">
              <p>No draft posts yet.</p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                
              </p>
            </div>
          ) : (
            <div className="drafts_container">
              {drafts.map((draft) => (
                <div key={draft.id} className="draft_card">
                  <div className="draft_card_header">
                    <div className="draft_user_info">
                      <div className="draft_avatar">
                        {(draft.username || user?.username)?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="draft_meta">
                        <span className="draft_username">
                          {draft.username ? `@${draft.username}` : 
                           user?.username ? `@${user.username}` : 
                           user?.email ? user.email.split('@')[0] : 'user'}
                        </span>
                        <span className="draft_date">{new Date(draft.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="draft_category">{draft.post_category}</span>
                    </div>
                  </div>
                  
                  <h2 className="draft_title">{draft.post_title}</h2>
                  
                  {draft.post_content && (
                    <p className="draft_content_preview">
                      {draft.post_content.substring(0, 150)}
                      {draft.post_content.length > 150 ? '...' : ''}
                    </p>
                  )}
                  
                  {draft.post_image && (
                    <div className="draft_image_preview">
                      <img src={draft.post_image} alt="Draft preview" />
                    </div>
                  )}

                  <div className="draft_card_actions">
                    <button 
                      className="draft_action_btn draft_publish_btn" 
                      onClick={() => handlePublishDraft(draft.id)}
                    >
                      Post
                    </button>
                    <button 
                      className="draft_action_btn draft_delete_btn" 
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isProfilePageOpen && (
        <ProfilePage setIsProfilePageOpen={setIsProfilePageOpen} />
      )}
      {isSettingOpen && <Settings setIsSettingOpen={setIsSettingOpen} />}
      {openHelpPage && <HelpPage cycleOpenHelpPage={cycleOpenHelpPage} />}
    </div>
  );
}