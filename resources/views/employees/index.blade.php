@extends('layouts.app')
@section('content')


    <table id="table_id" class="display">
        <thead>
        <tr>
            <th>Name</th>
            <th>Lastname</th>
            <th>LinkedIn URL</th>
            <th>Company</th>
            <th>Title</th>
            <th>Location</th>
            <th>Is Active employee</th>
            <th>Past employee duration</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($employees as $employee)
            <tr>
                <td>{{$employee->name}}</td>
                <td>{{$employee->last_name}}</td>
                <td>{{$employee->linkedin_url}}</td>
                <td>{{$employee->company_name}}</td>
                <td>{{$employee->title}}</td>
                <td>{{$employee->location}}</td>
                <td>@if ($employee->is_active_employee == 1) active @else past @endif</td>
                <td>{{$employee->past_experience_date}}</td>
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
