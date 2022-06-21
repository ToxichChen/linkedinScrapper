@extends('layouts.app')
@section('content')
    <form method="post" action="/companies/create">
        @csrf
        <div class="form-group">
            <label for="company_name">Enter company name</label>
            <input class="form-control" type="text" id="company_name" name="company_name" placeholder="Enter company name">
        </div>
        <div class="form-group">
            <label for="company_url">Enter LinkedIn company url</label>
            <input class="form-control" type="text" id="company_url" name="company_url" placeholder="Enter company url">
        </div>
        <div class="form-group">
            <label for="company_sales_nav_id">Enter company id on sales nav</label>
            <input class="form-control" type="text" id="company_sales_nav_id" name="company_sales_nav_id" placeholder="Enter company url">
        </div>
        <div class="form-group">
            <label for="employees">Employees</label>
            <input class="form-control" type="number" id="employees" name="employees" placeholder="Enter employees count">
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
@endsection
