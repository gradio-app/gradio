function enable_sharing() {
  $("#send_link").click(function(evt) {
    let name = $("#share_name").val()
    let email = $("#share_email").val()
    if (name && email) {
      $.ajax({
        "url" : "https://gradio.app/send_email",
        "type": "POST",
        "crossDomain": true,
        "data": JSON.stringify({
          "url": config["ngrok_socket_url"],
          "name": name,
          "email": email
        }),
        "success": function() {
          $("#share_message").text("Shared successfully.");
          $("#share_more").text("Share more");
        },
        "error": function() {
          $("#share_message").text("Failed to share.");
          $("#share_more").text("Try again");
        },
        "complete": function() {
          $("#share_form").hide();
          $("#share_complete").show();
        }
      })
    }
  })
}

$("#share_more").click(function (evt) {
  $("#share_form").show();
  $("#share_complete").hide();
})
