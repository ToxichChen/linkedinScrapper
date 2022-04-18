@extends('layouts.app')
@section('content')


    <table id="table_id" class="display">
        <thead>
        <tr>
            <th>Company Name</th>
            <th>Company URL</th>
            <th>Company Sales Nav Id</th>
            <th>Parsed</th>
            <th>Employees</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($companies as $company)
            <tr>
                <td>{{$company->company_name}}</td>
                <td>{{$company->company_url}}</td>
                <td>{{$company->company_sales_nav_id}}</td>
                <td>{{$company->is_parsed}}</td>
                <td>{{$company->employees}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <script>
        $(document).ready(function () {
            $('#table_id').DataTable();
        });
    </script>
@endsection