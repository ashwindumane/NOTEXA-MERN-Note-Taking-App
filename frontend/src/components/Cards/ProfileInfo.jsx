import { getInitials } from '../../pages/utils/helper'

const ProfileInfo = ({ userInfo, onLogout }) => {
  const hasUser = Boolean(userInfo?.fullName)
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
        {hasUser ? getInitials(userInfo.fullName) : '👤'}
      </div>
      <div>
        <p className="text-sm font-medium">{hasUser ? userInfo.fullName : 'Guest'}</p>
        {hasUser && (
          <button className="text-sm text-slate-700 underline" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  )
}

export default ProfileInfo
