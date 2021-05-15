$('.cardbaiviet').slice(0, 10).show()
var loading = false;
var endpage = false;
$(window).scroll(function() {

    if (!loading && ($(window).scrollTop() > $(document).height() - $(window).height() - 5)) {
        loading = true;
        console.log("load");
        $('.cardbaiviet:hidden').slice(0, 10).show()

        if ($('.cardbaiviet:hidden').length == 0 && !endpage) {
            $('.loadmore').fadeOut()
            $('.textloadmore').append('Không còn dữ liệu bài viết')
            endpage = true;
        }

        loading = false; // reset value of loading once content loaded
    }
});


$('.loadmore').on('click', function() {
    $('.cardbaiviet:hidden').slice(0, 10).show()

    if ($('.cardbaiviet:hidden').length == 0) {
        $('.loadmore').fadeOut()
        $('.textloadmore').append('Không còn dữ liệu bài viết')
    }
})

function openNav() {
    document.getElementById("mySidebar").style.width = "200px";
    document.getElementById("main").style.marginLeft = "200px";
    document.getElementById("btn_openNav").style.visibility = "hidden"
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.getElementById("btn_openNav").style.visibility = "visible"
}


function textAreaAdjust(element) {
    element.style.height = "1px";
    element.style.height = (25 + element.scrollHeight) + "px";
}

var expanded = false;

function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
    } else {
        checkboxes.style.display = "none";
        expanded = false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////
$(function() {
    //Thêm bài viết
    $('#dangtin').on('submit', function(e) {
        e.preventDefault()
        var noidung = $('#noidung').val()
        var masinhvien = $('#masinhvien').val()
        var fullname = $('#fullname').val()
        var anhdaidien = $('#anhdaidien').val()
        var hinhanhdang = $('#hinhanh')[0].files;
        var urlyoutube = $('#urlyoutube').val()
        if (urlyoutube) {
            var urlyoutube = $('#urlyoutube').val().split('src=')[1].split(/[ >]/)[0]
            urlyoutube = urlyoutube.replaceAll('"', '')
        } else {
            urlyoutube = ''
        }
        var error = "";
        if (noidung == "" && hinhanhdang.length == 0 && urlyoutube == "") {
            error = "Yêu cầu nhập nội dung bài viết hoặc chọn hình ảnh hoặc chọn video";
        } else if (hinhanhdang.length > 0 && urlyoutube.length > 0) {
            error = "Không thể đăng cả video cả hình ảnh";
        } else {
            var dataform = new FormData();
            dataform.append("masinhvien", masinhvien);
            dataform.append("noidung", noidung);
            dataform.append("fullname", fullname);
            dataform.append("anhdaidien", anhdaidien);
            dataform.append("urlyoutube", urlyoutube);

            var fsize = 0;
            for (let i = 0; i < hinhanhdang.length; i++) {
                var name = document.getElementById("hinhanh").files[i].name;
                var ext = name.split('.').pop().toLowerCase();
                if (jQuery.inArray(ext, ['gif', 'png', 'jpg', 'jpeg', 'mp4']) == -1) {
                    error = "Ảnh không đúng định dạng!";
                } else {
                    var oFReader = new FileReader();
                    oFReader.readAsDataURL(document.getElementById("hinhanh").files[i]);
                    var f = document.getElementById("hinhanh").files[i];
                    fsize = fsize + f.size || f.fileSize;
                    if (fsize > 1000000000) {
                        error = "kích thước ảnh quá lớn";
                    } else {
                        dataform.append("hinhanh[]", document.getElementById("hinhanh").files[i]);

                    }
                }
            }
        }

        if (error != "") {
            alert(error)
        } else {

            $.ajax({
                type: 'POST',
                url: '/student/dangtin',
                cache: false,
                contentType: false,
                processData: false,
                data: dataform,
                success: function(data) {
                    if (data.dangtinthanhcong === 'dangtinthanhcong') {
                        alert('Đăng tin thành công')
                        $('#noidung').val("");
                        document.getElementById('hinhanh').value = '';
                        //alert("Đăng bài viết thành công!");
                        let hientin = $('div.hienbaiviet')
                        hientin.html('')
                        hientin.append(`
                                            <div class="card-header ">
                                                <div class="d-flex justify-content-between align-items-center ">
                                                    <div class="d-flex justify-content-between align-items-center ">
                                                        <div class="mr-2 ">
                                                            <img class="rounded-circle avatar" src="/uploads/anhdaidien/${data.anhdaidien} " alt=" ">
                                                        </div>
                                                        <div class="ml-2 ">
                                                            <div class="h5 m-0 ">${data.fullname}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div class="dropdown ">
                                                            <button class="btn btn-link dropdown-toggle " type="button " id=" " data-toggle="dropdown "  ">
                                                                <i  class="fa fa-ellipsis-h "></i>
                                                            </button>
                                                            <div class="dropdown-menu dropdown-menu-right ">
                                                                <div class="h6 dropdown-header ">Configuration</div>
                                                                <a class="dropdown-item " href="# ">Delete</a>
                                                                <a class="dropdown-item " href="# ">Report</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            <div class="card-body ">
                                                <div class="text-muted h7 mb-2 "> <i class="fas fa-clock" aria-hidden="true "></i>Đã đăng: ${data.thoigian}</div>
                                                <p class="card-text texthienthi">
                                                    
                                                </p>
                                                <div class="linkvideo"></div>
                                                <div class='img-1' id='hienhinhanh'>
                                                    
                                                </div>
                                            </div>
                                            <div class="card-footer border-bottom bg-light">
                                                <a href="# " class="card-link " onclick="openComment() "><i class="fa fa-comment "></i> Comment</a>
                                            </div>
                                        `)

                    }
                    $.each(data.filename, function(i, order) {
                        $('#hienhinhanh').prepend(`<img src='/uploads/anhbaiviet/${data.filename[i]}'>`)
                    })
                    if (data.noidung) {
                        $('.texthienthi').prepend(`${data.noidung}`)
                    }
                    if (data.video) {
                        $('.linkvideo').prepend(`<iframe class='iframe' width="100%" height="300" src="${data.video}"></iframe>`)
                    }
                },
                error: function() {
                    alert("Đăng tin không thành công");
                }

            })
        }

    })
})

////////////////////////////////////////////////////////////////////////////////////////
//Xoá bài viết
$('.btnxoabaiviet').click(e => {
    e.preventDefault()

    let noidung = $(e.target).data('noidung')
    let id = $(e.target).data('id')
    console.log(noidung)
    $('#modalxoabaiviet .noidungbaiviet').html(noidung)
    $('#modalxoabaiviet .chapnhanxoabaiviet').attr('data-id', id)

})

$('#modalxoabaiviet .chapnhanxoabaiviet').click(e => {
    let id = e.target.dataset.id
    $('#modalxoabaiviet').modal('hide')
    deleteBaiViet(id)
})

function deleteBaiViet(id) {
    var dataform = new FormData();
    dataform.append("id", id);
    console.log(id)
    $.ajax({
        type: 'POST',
        url: '/student/xoabaiviet',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            if (data.code == 0) {
                alert('Xoá bài viết thành công')
                $(`div#${id}`).remove()
            } else {
                alert('Xoá bài viết không thành công')
            }
        },
        error: function() {
            console.log('Xoá bài viết không thành công')
        }
    })
}

////////////////////////////////////////////////////////////////////////////////////////
//Chỉnh sửa bài viết
let hinhanhbixoa = ''
let hinhanhchinhsua = ''

$('.btnchinhsuabaiviet').click(e => {
    e.preventDefault()

    $('#modalchinhsuabaiviet .divvideo').html('')
    $('#modalchinhsuabaiviet .linkyoutube').val('')
    $('#anhmoicuabaiviet').attr('src', '#')
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-video', '')

    let txtnoidung = $(e.target).data('txtnoidung')
    let id = $(e.target).data('id')

    let video = $(e.target).data('video')


    hinhanhchinhsua = $(e.target).data('image')

    // kiểm tra textarea có rỗng hay không
    if (txtnoidung === undefined) {
        $('#modalchinhsuabaiviet .txtnoidung').attr("placeholder", "Hãy thử viết gì đó!")
    } else {
        $('#modalchinhsuabaiviet .txtnoidung').val(txtnoidung)
    }

    //hiển thị video
    if (video.length > 0) {
        //làm cho hiện video
        $('#modalchinhsuabaiviet .divvideo').append(`<div><button type="button" class="btn cursor-pointer btnDeleteVideo">&times;</button><iframe width="100%" height="300" class="video" src="${video}"></iframe></div>`)
        $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-video', video)
    }


    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-id', id)
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-txtnoidung', txtnoidung)
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-image', hinhanhchinhsua)


    // xoá table ảnh 
    $('#modalchinhsuabaiviet .rowhinhanh').html('')

    // sau đó in tất cả các ảnh ra màn hình chia sẻ
    if (hinhanhchinhsua) {
        $.each(hinhanhchinhsua.split(','), function(i) {
            $('#modalchinhsuabaiviet .rowhinhanh').prepend(`<tr><td><button type="button" class="btn cursor-pointer btnDeleteImg">&times;</button><img class='chinhsuahinhanh' src='/uploads/anhbaiviet/${hinhanhchinhsua.split(',')[i]}'></td></tr>`)
        })
    }


    // thay đổi textarea của người dùng
    $('#modalchinhsuabaiviet .txtnoidung').keyup(function() {
        $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-txtnoidung', $(this).val())
    });
    console.log(video)
        // lấy link của người dùng ra
    $('#modalchinhsuabaiviet .linkyoutube').keyup(function() {
        // kiểm tra định dạng link
        if ($(this).val().includes('src=')) {
            $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-video', $(this).val().split('src=')[1].split(/[ >]/)[0].replaceAll('"', ''))

            $('#modalchinhsuabaiviet .divvideo').html('')
        } else {
            alert('Link không đúng định dạng')
        }

    });

})

$(document).on("click", '.btnDeleteImg', function() {

    $(this).closest('tr').remove();

    //tách chuỗi lấy tên
    hinhanhbixoa = ($(this).closest('tr').find("img").attr("src").split('/')[3])
    hinhanhchinhsua = hinhanhchinhsua.replace(',', '')

    //duyệt qua chuỗi kiểm tra hình ảnh có bị lấy ra không thì xoá khỏi chuỗi hình ảnh
    $.each(hinhanhchinhsua.split(' '), function(i) {
        if ((hinhanhchinhsua.split(' ')[i]).includes(hinhanhbixoa)) {
            hinhanhchinhsua = hinhanhchinhsua.replace(hinhanhbixoa, '')
        }
    })

    // đưa data vào nút chỉnh sửa. Nếu không có thì remove để nó không báo lỗi
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-image', hinhanhchinhsua)
    if (!hinhanhchinhsua) {
        $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').removeAttr('data-image')
    }
});
$(document).on('click', '.btnDeleteVideo', function() {
    $(this).closest('div').remove()
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').removeAttr('data-video')
    $('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').attr('data-video', '')
})

$('#modalchinhsuabaiviet .chapnhanchinhsuabaiviet').click(e => {
    // Có ảnh cũ
    if (e.target.dataset.image) {
        let hinhanh = e.target.dataset.image
        let id = e.target.dataset.id
        let txtnoidung = e.target.dataset.txtnoidung
        let video = e.target.dataset.video

        //thêm ảnh mơi
        var anhmoi = $('#input_anhmoicuabaiviet')[0].files;


        // trường hợp nếu có ảnh mới
        if (anhmoi.length != 0) {
            var oFReader = new FileReader();
            oFReader.readAsDataURL(document.getElementById("input_anhmoicuabaiviet").files[0]);
            var f = document.getElementById("input_anhmoicuabaiviet").files[0];
            var fsize = f.size || f.fileSize;
            if (fsize > 2000000) {
                alert("Kích thước ảnh quá lớn");
            }
            // xét tường họp có video và ảnh
            if ((video && hinhanh) || (video && anhmoi)) {
                alert('Không để cùng đăng cả video và ảnh')

            } else {
                chinhsuaBaiVietCoAnhMoi(id, txtnoidung, hinhanh, anhmoi)
            }

        } // trường hợp ko có ảnh mới 
        else {
            if ((video && hinhanh) || (video && anhmoi)) {
                alert('Không để cùng đăng cả video và ảnh')

            } else {
                chinhsuaBaiVietKhongCoAnhMoi(id, txtnoidung, hinhanh)
            }

        }
        $('#modalchinhsuabaiviet').modal('hide')


    }
    // không có ảnh cũ
    else {

        let id = e.target.dataset.id
        let txtnoidung = e.target.dataset.txtnoidung
        let video = e.target.dataset.video

        //thêm ảnh mơi
        var anhmoi = $('#input_anhmoicuabaiviet')[0].files;


        // trường hợp nếu có ảnh mới
        if (anhmoi.length != 0) {
            var oFReader = new FileReader();
            oFReader.readAsDataURL(document.getElementById("input_anhmoicuabaiviet").files[0]);
            var f = document.getElementById("input_anhmoicuabaiviet").files[0];
            var fsize = f.size || f.fileSize;
            if (fsize > 2000000) {
                alert("Kích thước ảnh quá lớn");
            }
            if (!txtnoidung && !anhmoi) {
                alert('Không có nội dung hoặc hình ảnh')
                    // kiểm tra video và ảnh cùng đăng
            } else if (video && anhmoi) {
                alert('Không để cùng đăng cả video và ảnh')
            } else {
                KoAnhCuchinhsuaBaiVietCoAnhMoi(id, txtnoidung, anhmoi)
            }
        } // trường hợp ko có ảnh mới 
        else {
            if (!txtnoidung && !video) {
                alert('Không có nội dung hoặc video hoặc hình ảnh')
            } else if (!video) {
                KoAnhCuchinhsuaBaiVietKhongCoAnhMoi(id, txtnoidung)
            } else {
                KoAnhCuchinhsuaBaiVietKhongCoAnhMoi(id, txtnoidung, video)
            }
        }
        $('#modalchinhsuabaiviet').modal('hide')
    }
})

function chinhsuaBaiVietCoAnhMoi(id, txtnoidung, hinhanh, anhmoi) {
    var dataform = new FormData();
    dataform.append("id", id);
    dataform.append("txtnoidung", txtnoidung);
    dataform.append("hinhanh", hinhanh);

    dataform.append("anhmoi", document.getElementById("input_anhmoicuabaiviet").files[0]);
    $("#anhmoicuabaiviet").attr("src", "#");

    $.ajax({
        type: 'POST',
        url: '/student/chinhsuabaivietcoanhmoi',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            console.log(data)
            if (data.code == 0) {
                alert('Chỉnh sửa bài viết thành công')
                $(`div#${id}`).html('')
                $(`div#${id}`).append(`

                
                    <div class="card-header ">
                        <div class="d-flex justify-content-between align-items-center ">
                            <div class="d-flex justify-content-between align-items-center ">
                                <div class="mr-2 ">
                                    <img class="rounded-circle " width="45 " src="/uploads/anhdaidien/${data.anhdaidien}" alt=" ">
                                </div>
                                <div class="ml-2 ">
                                    <div class="h5 m-0 ">${data.fullname}</div>
                                </div>
                            </div>
                            <div>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle " type="button" data-toggle="dropdown" >
                                        <i  class="fa fa-ellipsis-h "></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right ">
                                        <a class="dropdown-item btnchinhsuabaiviet" >Chỉnh sửa </a>
                                        <a class="dropdown-item btnxoabaiviet" >Xoá</a>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                    </div>
                    
                    <div class="card-body ">
                        <div class="text-muted h7 mb-2 "> <i class="fas fa-clock " aria-hidden="true "></i>Đã đăng: ${data.thoigianhienthi}</div>

                        <p class="card-text ">
                            ${data.txtnoidung } 
                        </p>

                        
                        <div class='img-1' id='hinhanhchinhsua'>
                             
                        </div>
                        
                    </div>
                    <div class="card-footer border-bottom bg-light">
                        <a href="# " class="card-link " onclick="openComment() "><i class="fa fa-comment "></i> Comment</a>
                    </div>
                `)
                $.each(data.hinhanh, function(i) {
                    $('#hinhanhchinhsua').prepend(`<img src='/uploads/anhbaiviet/${data.hinhanh[i]}'>`)
                })
            } else {
                alert('Chỉnh sửa bài viết không thành công')
            }

        },
        error: function() {
            console.log('Chỉnh sửa bài viết không thành công')
        }
    })
}



function chinhsuaBaiVietKhongCoAnhMoi(id, txtnoidung, hinhanh) {
    var dataform = new FormData();
    dataform.append("id", id);
    dataform.append("txtnoidung", txtnoidung);
    dataform.append("hinhanh", hinhanh);

    $.ajax({
        type: 'POST',
        url: '/student/chinhsuabaivietkhongcoanhmoi',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            console.log(data)
            if (data.code == 0) {
                alert('Chỉnh sửa bài viết thành công')
                $(`div#${id}`).html('')
                $(`div#${id}`).append(`

                
                    <div class="card-header ">
                        <div class="d-flex justify-content-between align-items-center ">
                            <div class="d-flex justify-content-between align-items-center ">
                                <div class="mr-2 ">
                                    <img class="rounded-circle " width="45 " src="/uploads/anhdaidien/${data.anhdaidien}" alt=" ">
                                </div>
                                <div class="ml-2 ">
                                    <div class="h5 m-0 ">${data.fullname}</div>
                                </div>
                            </div>
                            <div>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle " type="button" data-toggle="dropdown" >
                                        <i  class="fa fa-ellipsis-h "></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right ">
                                        <a class="dropdown-item btnchinhsuabaiviet" >Chỉnh sửa </a>
                                        <a class="dropdown-item btnxoabaiviet" >Xoá</a>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                    </div>
                    
                    <div class="card-body ">
                        <div class="text-muted h7 mb-2 "> <i class="fas fa-clock " aria-hidden="true "></i>Đã đăng: ${data.thoigianhienthi}</div>

                        <p class="card-text ">
                            ${data.txtnoidung } 
                        </p>

                        
                        <div class='img-1' id='hinhanhchinhsua'>
                             
                        </div>
                        
                    </div>
                    <div class="card-footer border-bottom bg-light">
                        <a href="# " class="card-link " onclick="openComment() "><i class="fa fa-comment "></i> Comment</a>
                    </div>
                `)
                $.each(data.hinhanh, function(i) {
                    $('#hinhanhchinhsua').prepend(`<img src='/uploads/anhbaiviet/${data.hinhanh[i]}'>`)
                })
            } else {
                alert('Chỉnh sửa bài viết không thành công')
            }

        },
        error: function() {
            console.log('Chỉnh sửa bài viết không thành công')
        }
    })
}



function KoAnhCuchinhsuaBaiVietCoAnhMoi(id, txtnoidung, anhmoi) {
    var dataform = new FormData();
    dataform.append("id", id);
    dataform.append("txtnoidung", txtnoidung);

    dataform.append("anhmoi", document.getElementById("input_anhmoicuabaiviet").files[0]);
    $("#anhmoicuabaiviet").attr("src", "#");

    $.ajax({
        type: 'POST',
        url: '/student/koanhcuchinhsuabaivietcoanhmoi',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            console.log(data)
            if (data.code == 0) {
                alert('Chỉnh sửa bài viết thành công')
                $(`div#${id}`).html('')
                $(`div#${id}`).append(`

                
                    <div class="card-header ">
                        <div class="d-flex justify-content-between align-items-center ">
                            <div class="d-flex justify-content-between align-items-center ">
                                <div class="mr-2 ">
                                    <img class="rounded-circle " width="45 " src="/uploads/anhdaidien/${data.anhdaidien}" alt=" ">
                                </div>
                                <div class="ml-2 ">
                                    <div class="h5 m-0 ">${data.fullname}</div>
                                </div>
                            </div>
                            <div>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle " type="button" data-toggle="dropdown" >
                                        <i  class="fa fa-ellipsis-h "></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right ">
                                        <a class="dropdown-item btnchinhsuabaiviet" >Chỉnh sửa </a>
                                        <a class="dropdown-item btnxoabaiviet" >Xoá</a>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                    </div>
                    
                    <div class="card-body ">
                        <div class="text-muted h7 mb-2 "> <i class="fas fa-clock " aria-hidden="true "></i>Đã đăng: ${data.thoigianhienthi}</div>

                        <p class="card-text ">
                            ${data.txtnoidung } 
                        </p>

                        
                        <div class='img-1' id='hinhanhchinhsua'>
                             
                        </div>
                        
                    </div>
                    <div class="card-footer border-bottom bg-light">
                        <a href="# " class="card-link " onclick="openComment() "><i class="fa fa-comment "></i> Comment</a>
                    </div>
                `)
                $.each(data.hinhanh, function(i) {
                    $('#hinhanhchinhsua').prepend(`<img src='/uploads/anhbaiviet/${data.hinhanh[i]}'>`)
                })
            } else {
                alert('Chỉnh sửa bài viết không thành công')
            }

        },
        error: function() {
            console.log('Chỉnh sửa bài viết không thành công')
        }
    })
}



function KoAnhCuchinhsuaBaiVietKhongCoAnhMoi(id, txtnoidung, video) {
    var dataform = new FormData();
    dataform.append("id", id);
    dataform.append("txtnoidung", txtnoidung);
    if (video) {
        dataform.append("video", video);
    }


    $.ajax({
        type: 'POST',
        url: '/student/koanhcuchinhsuabaivietkhongcoanhmoi',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            console.log(data)
            if (data.code == 0) {
                alert('Chỉnh sửa bài viết thành công')
                $(`div#${id}`).html('')
                $(`div#${id}`).append(`

                
                    <div class="card-header ">
                        <div class="d-flex justify-content-between align-items-center ">
                            <div class="d-flex justify-content-between align-items-center ">
                                <div class="mr-2 ">
                                    <img class="rounded-circle " width="45 " src="/uploads/anhdaidien/${data.anhdaidien}" alt=" ">
                                </div>
                                <div class="ml-2 ">
                                    <div class="h5 m-0 ">${data.fullname}</div>
                                </div>
                            </div>
                            <div>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle " type="button" data-toggle="dropdown" >
                                        <i  class="fa fa-ellipsis-h "></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right ">
                                        <a class="dropdown-item btnchinhsuabaiviet" >Chỉnh sửa </a>
                                        <a class="dropdown-item btnxoabaiviet" >Xoá</a>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                    </div>
                    
                    <div class="card-body ">
                        <div class="text-muted h7 mb-2 "> <i class="fas fa-clock " aria-hidden="true "></i>Đã đăng: ${data.thoigianhienthi}</div>

                        <p class="card-text ">
                            ${data.txtnoidung } 
                        </p>
                        <div class="linkvideo"></div>
                        
                        <div class='img-1' id='hinhanhchinhsua'>
                             
                        </div>
                        
                    </div>
                    <div class="card-footer border-bottom bg-light">
                        <a href="# " class="card-link " onclick="openComment() "><i class="fa fa-comment "></i> Comment</a>
                    </div>
                `)
                if (data.video) {
                    $('.linkvideo').prepend(`<iframe class='iframe' width="100%" height="300" src="${data.video}"></iframe>`)
                }
            } else {
                alert('Chỉnh sửa bài viết không thành công')
            }

        },
        error: function() {
            console.log('Chỉnh sửa bài viết không thành công')
        }
    })
}



$('.comment').hide();
$('.btn_ancomment').click(e => {
    e.preventDefault()
    let mabaiviet = $(e.target).data('mabaiviet')
    $('.comment[data-mabaiviet="' + mabaiviet + '"]').hide();
})

// mở bình luận
$('.btncomment').click(e => {
    e.preventDefault()
    let mabaiviet = $(e.target).data('mabaiviet')
    let manguoidung = $(e.target).data('manguoidung')
    $('.comment[data-mabaiviet="' + mabaiviet + '"]').show()

    //gán data-id cho nút gửi bình luận
    // $('.btndangbinhluan').attr("data-mabaiviet", mabaiviet)
    // $('.btndangbinhluan').attr("data-manguoidung", manguoidung)

    // lấy nội dung trong txt
    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
        $('.btndangbinhluan[data-mabaiviet="' + mabaiviet + '"]').attr('data-txtbinhluan', $(this).val())
    });
    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
        $('.btndangbinhluanquanly[data-mabaiviet="' + mabaiviet + '"]').attr('data-txtbinhluan', $(this).val())
    });
})

// đăng bình luận student
$('.btndangbinhluan').click(e => {
    let manguoidung = e.target.dataset.manguoidung
    let mabaiviet = e.target.dataset.mabaiviet
    let txtbinhluan = e.target.dataset.txtbinhluan

    if (!txtbinhluan) {
        alert('Chưa nhập nội dung bình luận')
    } else {
        $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
            $('.btndangbinhluan[data-mabaiviet="' + mabaiviet + '"]').data('txtbinhluan', $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').val())
        });
        var dataform = new FormData();
        dataform.append("mabaiviet", mabaiviet);
        dataform.append("txtbinhluan", txtbinhluan);
        dataform.append("manguoidung", manguoidung);
        $.ajax({
            type: 'POST',
            url: '/student/dangbinhluan',
            cache: false,
            contentType: false,
            processData: false,
            data: dataform,
            success: function(data) {
                console.log(data)
                if (data.code == 0) {
                    alert('Đăng bình luận thành công')
                    let hienbinhluan = $(`div.hienbinhluan${mabaiviet}`)
                    hienbinhluan.html('')
                    hienbinhluan.append(`
                    <div class="user-comment mb-3">
                        <div class="d-flex mb-2 ">
                            <div class="mr-2 ">
                                <img class="rounded-circle avatar" src="/uploads/anhdaidien/${data.hinhanh}" alt=" ">
                            </div>
                            <div class="ml-2 mt-1 ">
                                    <p>
                                    <a class="text-decoration-none text-dark" href="">
                                        <b>${data.fullname}</b>
                                    </a>
                                    <span class="text-muted">${data.thoigian}</span>
                                </p>
                                <p>${data.txtbinhluan}<a class="text-danger text-decoration-none" data-toggle="modal" href="#" data-target="#xoabinhluan"><small>Xoá</small></a></p>
                            </div>
                        </div>
                    </div>
                    `)
                    $('.btndangbinhluan[data-mabaiviet="' + mabaiviet + '"]').removeAttr('data-txtbinhluan')
                    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').val('')
                    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
                        $('.btndangbinhluan[data-mabaiviet="' + mabaiviet + '"]').attr('data-txtbinhluan', $(this).val())
                    });

                } else {
                    alert('Đăng bình luận không thành công')
                }
            },
            error: function() {
                console.log('Đăng bình luận không thành công')
            }
        })
    }
})


//Xoá bình luận student
$('.btnxoabinhluan').click(e => {
    e.preventDefault()

    let noidung = $(e.target).data('noidung')
    let id = $(e.target).data('id')
    $('#modalxoabinhluan .noidungbinhluan').html(noidung)
    $('#modalxoabinhluan .chapnhanxoabinhluan').attr('data-id', id)

})

$('#modalxoabinhluan .chapnhanxoabinhluan').click(e => {
    let id = e.target.dataset.id
    $('#modalxoabinhluan').modal('hide')
    deleteBinhluan(id)
})

function deleteBinhluan(id) {
    var dataform = new FormData();
    dataform.append("id", id);
    console.log(id)
    $.ajax({
        type: 'POST',
        url: '/student/xoabinhluan',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            if (data.code == 0) {
                alert('Xoá bình luận thành công')
                $(`div#${id}`).remove()
            } else {
                alert('Xoá bình luận không thành công')
            }
        },
        error: function() {
            console.log('Xoá bình luận không thành công')
        }
    })
}



//đăng bình luận quản lý
$('.btndangbinhluanquanly').click(e => {
    let manguoidung = e.target.dataset.manguoidung
    let mabaiviet = e.target.dataset.mabaiviet
    let txtbinhluan = e.target.dataset.txtbinhluan

    if (!txtbinhluan) {
        alert('Chưa nhập nội dung bình luận')
    } else {
        $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
            $('.btndangbinhluanquanly[data-mabaiviet="' + mabaiviet + '"]').data('txtbinhluan', $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').val())
        });
        var dataform = new FormData();
        dataform.append("mabaiviet", mabaiviet);
        dataform.append("txtbinhluan", txtbinhluan);
        dataform.append("manguoidung", manguoidung);
        $.ajax({
            type: 'POST',
            url: '/quanly/dangbinhluan',
            cache: false,
            contentType: false,
            processData: false,
            data: dataform,
            success: function(data) {
                console.log(data)
                if (data.code == 0) {
                    alert('Đăng bình luận thành công')
                    let hienbinhluan = $(`div.hienbinhluan${mabaiviet}`)
                    hienbinhluan.html('')
                    hienbinhluan.append(`
                    <div class="user-comment mb-3">
                        <div class="d-flex mb-2 ">
                            <div class="mr-2 ">
                                <img class="rounded-circle avatar" src="/images/${data.hinhanh}" alt=" ">
                            </div>
                            <div class="ml-2 mt-1 ">
                                    <p>
                                    <a class="text-decoration-none text-dark" href="">
                                        <b>${data.fullname}</b>
                                    </a>
                                    <span class="text-muted">${data.thoigian}</span>
                                </p>
                                <p>${data.txtbinhluan}<a class="text-danger text-decoration-none" data-toggle="modal" href="#" data-target="#xoabinhluan"><small>Xoá</small></a></p>
                            </div>
                        </div>
                    </div>
                    `)
                    $('.btndangbinhluanquanly[data-mabaiviet="' + mabaiviet + '"]').removeAttr('data-txtbinhluan')
                    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').val('')
                    $('.txtbinhluan[data-mabaiviet="' + mabaiviet + '"]').keyup(function() {
                        $('.btndangbinhluanquanly[data-mabaiviet="' + mabaiviet + '"]').attr('data-txtbinhluan', $(this).val())
                    });

                } else {
                    alert('Đăng bình luận không thành công')
                }
            },
            error: function() {
                console.log('Đăng bình luận không thành công')
            }
        })
    }
})

var socket = io("https://nodejs-webapp-123.herokuapp.com/")

function guiThongBao() {
    socket.emit("messageSend", {
        "phong": document.getElementById('phong').value,
        "tieude": document.getElementById("tieude").value,
        "noidung": document.getElementById("noidung").value,
        "chonchuyenmuc": document.getElementById("chonchuyenmuc").value
    })
}
socket.on("messageSend", function(message) {
    if (message.tieude && message.noidung && message.chonchuyenmuc) {
        $.notify('Thông báo mới' + '\n Từ: ' + "\n" + message.phong, {
            className: 'success',
            element: 'body',
            offset: 20,
            allow_dismiss: false,
            delay: 2800,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            onShow: function() {
                this.css({ 'width': 'auto', 'height': 'auto' });
            },
        })
    }
})


// xoá thông báo
$('.btnxoathongbao').click(e => {
    e.preventDefault()

    let tieude = $(e.target).data('tieude')
    let id = $(e.target).data('id')
    console.log(tieude)
    $('#modalxoathongbao .noidungtieude').html(tieude)
    $('#modalxoathongbao .chapnhanxoathongbao').attr('data-id', id)

})

$('#modalxoathongbao .chapnhanxoathongbao').click(e => {
    let id = e.target.dataset.id
    $('#modalxoathongbao').modal('hide')
    deleteThongBao(id)
})

function deleteThongBao(id) {
    var dataform = new FormData();
    dataform.append("id", id);
    console.log(id)
    $.ajax({
        type: 'POST',
        url: '/quanly/xoathongbao',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            if (data.code == 0) {
                alert('Xoá thông báo thành công')
                $(`div#${id}`).remove()
            } else {
                alert('Xoá thông báo không thành công')
            }
        },
        error: function() {
            console.log('Xoá thông báo không thành công')
        }
    })
}


// chỉnh sửa thông báo
$('.btnchinhsuathongbao').click(e => {
    e.preventDefault()

    let allchuyenmuc = $('.allchuyenmuc').val()

    let tieude = $(e.target).data('tieude')
    let noidung = $(e.target).data('noidung')
    let chuyenmuc = $(e.target).data('chuyenmuc')
    let id = $(e.target).data('id')

    // đưa dữ liệu vào text
    $('#modalchinhsuathongbao .tieude').html(tieude)
    $('#modalchinhsuathongbao .noidung').html(noidung)
    $('#modalchinhsuathongbao .chuyenmuc').html(chuyenmuc)

    // đưa option vào select
    $('#modalchinhsuathongbao .chonchuyenmuc').append($('<option disabled selected value ></option >').val("").html(""));
    $.each(allchuyenmuc.split(','), function(i, order) {
        $('#modalchinhsuathongbao .chonchuyenmuc').append($('<option ></option>').val(allchuyenmuc.split(',')[i]).html(allchuyenmuc.split(',')[i]));
    })
    console.log($('#modalchinhsuathongbao .chonchuyenmuc').val())
        // attr data vào nút chính sửa
    $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-id', id)
    $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-tieude', tieude)
    $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-noidung', noidung)
    $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-chuyenmuc', $('#modalchinhsuathongbao .chonchuyenmuc').children("option:selected").val())
    $('#modalchinhsuathongbao select').on('change', function(e) {
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value;
        $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-chuyenmuc', valueSelected)
    });

    // Chỉnh sửa ô text mỗi khi nhập
    $('#modalchinhsuathongbao .tieude').keyup(function() {
        $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-tieude', $(this).val())
    });
    $('#modalchinhsuathongbao .noidung').keyup(function() {
        $('#modalchinhsuathongbao .chapnhanchinhsuathongbao').attr('data-noidung', $(this).val())
    });

})

$('#modalchinhsuathongbao .chapnhanchinhsuathongbao').click(e => {
    let id = e.target.dataset.id
    let tieude = e.target.dataset.tieude
    let noidung = e.target.dataset.noidung
    let chuyenmuc = e.target.dataset.chuyenmuc
    if (!chuyenmuc) {
        alert('Chưa chọn chuyên mục')
    } else if (!tieude) {
        alert('Chưa có tiêu đề')
    } else if (!noidung) {
        alert('Chưa có nội dung')
    } else {
        $('#modalchinhsuathongbao').modal('hide')
        chinhsuaThongBao(id, tieude, noidung, chuyenmuc)
    }
})

function chinhsuaThongBao(id, tieude, noidung, chuyenmuc) {
    var dataform = new FormData();
    dataform.append("id", id);
    dataform.append("tieude", tieude);
    dataform.append("noidung", noidung);
    dataform.append("chuyenmuc", chuyenmuc);

    $.ajax({
        type: 'POST',
        url: '/quanly/chinhsuathongbao',
        cache: false,
        contentType: false,
        processData: false,
        data: dataform,
        success: function(data) {
            if (data.code == 0) {
                alert('Chỉnh sửa thông báo thành công')
            } else {
                alert('Chỉnh sửa thông báo không thành công')
            }
        },
        error: function() {
            console.log('Chỉnh sửa thông báo không thành công')
        }
    })
}