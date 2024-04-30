function isEmpty(value) {
    return value === "" || value === undefined || value === null ? true : false;
}
const URL = "https://fir-1c7de-default-rtdb.firebaseio.com/itServiceProvider";

function loginUser() {
    if (isEmpty($("#emailId").val()) || isEmpty($("#pwdId").val())) {
        alert("Please fill Required Data");

    } else {
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/itServiceRegister.json",
            success: function (response) {
                let loginUserList = [];
                for (let i in response) {
                    let data = response[i];
                    data["userId"] = i;
                    loginUserList.push(data);
                }
                let isValid = false;
                for (let i = 0; i < loginUserList.length; i++) {
                    if (loginUserList[i].emailId == $("#emailId").val() && loginUserList[i].password == $("#pwdId").val()) {
                        isValid = true;
                        if (loginUserList[i].userType === "Customer") {
                            localStorage.setItem("userType", "CUSTOMER");
                        } else {
                            localStorage.setItem("userType", "COMPANY");
                        }
                        localStorage.setItem("userId", loginUserList[i].userId);
                        localStorage.setItem("userData", JSON.stringify(loginUserList[i]));

                        $("#emailId").val('');
                        window.location.href = "itServiceProvider.html";

                    }
                }
                if (!isValid) {
                    alert("User not found");
                }

            }, error: function (error) {
                alert("Something went wrong");
                // works when something goes wrong
            }
        });
    }
}
function registerUser() {

    if (isEmpty($("#userEmailId").val())
        || isEmpty($("#passwordId").val()) || isEmpty($("#contactId").val()) ||
        isEmpty($("input[name='userTypeRadio']:checked").val())) {

        alert("Please fill all the details");

    } else {
        isUserExist();
    }
}
function isUserExist() {
    $.ajax({
        type: 'get',
        contentType: "application/json",
        dataType: 'json',
        cache: false,
        url: URL + "/itServiceRegister.json",
        success: function (response) {
            let loginUserList = [];
            for (let i in response) {
                let data = response[i];
                data["userId"] = i;
                loginUserList.push(data);
            }
            for (let i = 0; i < loginUserList.length; i++) {
                if (loginUserList[i].emailId == $("#userEmailId").val()) {

                    alert("Email is already registred!!!!");
                    return false;
                }
            }
            let requestBody = {
                "emailId": $("#userEmailId").val(),
                "password": $("#passwordId").val(),
                "contactNum": $("#contactId").val(),
                "userType": $("input[name='userTypeRadio']:checked").val()
            }
            if ($("input[name='userTypeRadio']:checked").val() === "Customer") {

                if (isEmpty($("#customerName").val()) || isEmpty($("#addressId").val())) {

                    alert("Please fill all the details");
                    return false;

                } else {
                    requestBody['customerName'] = $("#customerName").val();
                    requestBody['addressId'] = $("#addressId").val();
                }


            } else if ($("input[name='userTypeRadio']:checked").val() === "Company") {
                if (isEmpty($("#companyName").val()) || isEmpty($("#companyRegNo").val())
                    || isEmpty($("#locationId").val())) {

                    alert("Please fill all the details");
                    return false;

                } else {
                    requestBody['companyName'] = $("#companyName").val();
                    requestBody['companyRegNo'] = $("#companyRegNo").val();
                    requestBody['locationId'] = $("#locationId").val();
                }
            }
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/itServiceRegister.json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#regModelId').modal('hide');
                    alert("Registerd sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });

        }, error: function (error) {
            alert("Something went wrong");
        }
    });
}

$(document).ready(function () {
    $("#customerDivId").hide();
    $("#companyDivId").hide();

    $('#regModelId').on('hidden.bs.modal', function (e) {
        $("#addressId").val("");
        $("#userEmailId").val("");
        $("#passwordId").val("");
        $("#contactId").val("");
        $("#companyName").val("");
        $("#companyRegNo").val("");
        $("#locationId").val("");
        $("#customerName").val("");
        $("#addressId").val("");
    })
    $('input[type=radio]').click(function () {
        if (this.value === "Customer") {
            $("#customerDivId").show();
            $("#companyDivId").hide();
        } else if (this.value === "Company") {
            $("#companyDivId").show();
            $("#customerDivId").hide();
        }
    });
})
