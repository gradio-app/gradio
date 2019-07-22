$("#share").click(function() {
  $("#share").hide()
  $("#share_form").css('display', 'flex')
})

$("#send_link").click(function(evt) {
  let name = $("#share_name").val()
  let email = $("#share_email").val()
  if (name && email) {
    $("#send_link").attr('disabled', true);
    $.ajax({
      "url" : "https://gradio.app/api/send-email/",
      "type": "POST",
      "crossDomain": true,
      "data": {
        "url": config["share_url"],
        "name": name,
        "email": email
      },
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
        $("#send_link").attr('disabled', false);
      }
    })
  }
})

$("#share_more").click(function (evt) {
  $("#share_email").val("");
  $("#share_form").show();
  $("#share_complete").hide();
})
