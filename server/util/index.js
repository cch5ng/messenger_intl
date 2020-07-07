const getEmailSendMixedMessage = (sentEmails, unsentEmails) => {
  let inviteCreatedEmailMessage = sentEmails.length ? 
    `Invitations were sent to ${sentEmails.join(', ')}.`:
    '';
  let inviteNotCreatedEmailMessage = unsentEmails.length ?
    ` Invitations were not sent to ${unsentEmails.join(', ')} because the invitation was already sent, pending, or rejected.`:
    '';
  return `${inviteCreatedEmailMessage}${inviteNotCreatedEmailMessage}`;
}

//internal invitations to registered users
const getInviteSendSuccessMessage = (emails) => {
  return `Invitations were sent to ${emails.join(', ')}.`
}

const getInviteNotSentMessage = (emails) => {
  return `Invitations were not sent to ${emails.join(', ')} because the invitation was already sent, pending, or rejected.`;
}

module.exports = {getEmailSendMixedMessage, getInviteSendSuccessMessage, getInviteNotSentMessage};
