import React from 'react';

const TeamMembers = ({ members }) => {
  const teamList = members || [];

  return (
    <div className="bg-[#1e1e26] rounded-2xl p-6 shadow-soft border border-border-default h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-6">Team Members</h2>
      <div className="flex flex-col">
        {teamList.map((member, index) => {
          const initials = member.initials || (member.name
            ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : '??');

          return (
            <React.Fragment key={index}>
              <div 
                className="flex items-center gap-4 py-3 rounded-xl transition-colors hover:bg-bg-surface cursor-pointer px-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#111116] flex items-center justify-center text-white font-bold text-sm border border-border-default flex-shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {member.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-[#94a3b8] mt-0.5">
                    {member.role || 'Member'}
                  </span>
                </div>
              </div>
              {/* Subtle horizontal divider line */}
              {index < teamList.length - 1 && (
                <div className="h-px bg-border-default mx-2 my-1" />
              )}
            </React.Fragment>
          );
        })}
        {teamList.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-4">No team members found.</p>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
