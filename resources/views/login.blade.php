<!DOCTYPE html>
<html dir="ltr" lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>BeenAcquired Login</title>
    <!-- Favicon icon -->
    <link rel="icon" type="image/png" sizes="16x16" href="/plugins/images/favicon.png">
    <!-- Custom CSS -->
    <link href="/css/main_login.css" rel="stylesheet">
    <link href="/css/login_util.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.6.0.js"
            integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
</head>

<body>

<style>
    .login-form {
        margin: auto;
    }
    .login-alerts {
        margin: auto;
        width:60%;
    }
</style>
<div class="login-alerts">
    @if ($errors)
        @foreach ($errors as $error)
            <div class="alert alert-danger" role="alert"> {{$error}} </div>
        @endforeach
    @endif
</div>
<div class="wrap-login100 p-t-50 p-b-90 login-form">
    <form class="login100-form validate-form flex-sb flex-w" method="post" action="/login/login">
        @csrf
        <span class="login100-form-title p-b-51">
        Login
        </span>
        <div class="wrap-input100 validate-input m-b-16" data-validate="Username is required">
            <input class="input100" type="text" name="email" placeholder="Username">
            <span class="focus-input100"></span>
        </div>
        <div class="wrap-input100 validate-input m-b-16" data-validate="Password is required">
            <input class="input100" type="password" name="password" placeholder="Password">
            <span class="focus-input100"></span>
        </div>

        <div class="container-login100-form-btn m-t-17">
            <button class="login100-form-btn">
                Login
            </button>
        </div>
    </form>
</div>


<script src="/plugins/bower_components/jquery/dist/jquery.min.js"></script>
<!-- Bootstrap tether Core JavaScript -->
<script src="bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="/js/app-style-switcher.js"></script>
<script src="/plugins/bower_components/jquery-sparkline/jquery.sparkline.min.js"></script>
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.js"></script>
<!--Wave Effects -->
<script src="/js/waves.js"></script>
<!--Menu sidebar -->
<script src="/js/sidebarmenu.js"></script>
<!--Custom JavaScript -->
<script src="/js/custom.js"></script>
<!--This page JavaScript -->
<!--chartis chart-->
<script src="/plugins/bower_components/chartist/dist/chartist.min.js"></script>
<script src="/plugins/bower_components/chartist-plugin-tooltips/dist/chartist-plugin-tooltip.min.js"></script>
<script src="/js/pages/dashboards/dashboard1.js"></script>
</body>

</html>
