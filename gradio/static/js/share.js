function enable_sharing() {
  $("#send_link").click(function(evt) {
    let name = $("#share_name").val()
    let email = $("#share_email").val()
    if (name && email) {
      $.post("https://gradio.app/send_email", {
        "url": config["ngrok_socket_url"],
        "name": name,
        "email": email
      }).done(function() {
        $("#share_message").text("Shared successfully.");
      }).fail(function() {
        $("#share_message").text("Failed to share.");
      }).always(function() {
        $("#share_form").hide();
        $("#share_complete").show();
      });
    }
  })
}

$("#share_more").click(function (evt) {
  $("#share_form").show();
  $("#share_complete").hide();  
})
