import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    username : Text;
    avatar : Text;
    status : Text;
    lastActive : Int;
  };

  type OldMessage = {
    sender : Principal;
    content : Text;
    timestamp : Int;
  };

  type OldConversation = {
    participants : [Principal];
    messages : [OldMessage];
  };

  type OldActorState = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    conversations : Map.Map<Text, OldConversation>;
  };

  type NewUserProfile = {
    username : Text;
    avatar : Text;
    status : Text;
    lastActive : Int;
  };

  type NewMessage = {
    sender : Principal;
    content : Text;
    image : ?Blob;
    timestamp : Int;
  };

  type NewConversation = {
    participants : [Principal];
    messages : [NewMessage];
  };

  type NewActorState = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    conversations : Map.Map<Text, NewConversation>;
  };

  public func run(old : OldActorState) : NewActorState {
    let updatedConversations = old.conversations.map<Text, OldConversation, NewConversation>(
      func(_id, oldConv) {
        let newMessages = oldConv.messages.map<OldMessage, NewMessage>(
          func(oldMsg) {
            {
              sender = oldMsg.sender;
              content = oldMsg.content;
              image = null;
              timestamp = oldMsg.timestamp;
            };
          }
        );
        { oldConv with messages = newMessages };
      }
    );

    {
      old with
      conversations = updatedConversations;
    };
  };
};
