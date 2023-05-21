interface IUserAvatar {
  name: string;
  self?: boolean;
  leader?: boolean;
}

const UserAvatar: React.FC<IUserAvatar> = ({ name, self, leader }) => {
  const firstLetter = name.charAt(0);

  return (
    <div className={`avatar placeholder ${leader && "indicator"}`}>
      {leader && (
        <span className="text-3xl bg-transparent border-none indicator-item indicator-center badge">
          👑
        </span>
      )}
      <div
        className={`w-24 rounded-full bg-neutral-focus text-neutral-content 
        ${self && "ring ring-primary ring-offset-base-100 ring-offset-4"}
        `}
      >
        <span className="text-4xl uppercase">{firstLetter}</span>
      </div>
    </div>
  );
};

export default UserAvatar;
