// var MAX_PREVIEW_ROWS = 100
//
// $('body').on('click', ".input_csv.drop_mode", function (e) {
//   $(this).parent().find(".hidden_upload").click();
// })
//
// $('body').on('drag dragstart dragend dragover dragenter dragleave drop', ".input_csv.drop_mode", function(e) {
//   e.preventDefault();
//   e.stopPropagation();
// })
//
// function loadTableFromFiles(files) {
//   Papa.parse(files[0], {
//   	complete: function(results) {
//       $(".input_csv").hide()
//       $(".input_csv").removeClass("drop_mode")
//       var data_array = results.data
//       var table_html = ""
//       for (var i = 0; i < data_array.length && i <= MAX_PREVIEW_ROWS; i++) {
//         row = data_array[i]
//         if (i == 0) {
//           table_html += "<tr class='header'>"
//         } else {
//           table_html += "<tr>"
//         }
//         for (var c = 0; c < row.length; c++) {
//           table_html += "<td>" + row[c] + "</td>"
//         }
//         table_html += "</tr>"
//       }
//       table_html += ""
//       $(".csv_preview").html(table_html)
//       $(".table_holder").show()
//   	}
//   })
// }
//
// $(".input_csv").on('drop', function(e) {
//   files = e.originalEvent.dataTransfer.files;
//   loadTableFromFiles(files)
// });
//
// $(".hidden_upload").on("change", function() {
//   var files = !!this.files ? this.files : []
//   if (!files.length || !window.FileReader) {
//     return
//   }
//   loadTableFromFiles(files)
// })
//
// $('body').on('click', '.clear', function(e) {
//   $(".hidden_upload").prop("value", "")
//   $(".input_csv").show()
//   $(".input_csv").addClass("drop_mode")
//   $(".table_holder").hide()
// })
// $('body').on('click', '.submit', function(e) {
//   loadStart();
// })
